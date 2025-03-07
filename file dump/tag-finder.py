from pathlib import Path
import re

DIRECTORY = "../Translation/" # Directory to search for xml files in

def find_all_tags_in_directory(directory):
	"""
	Return a set of all tags that exist in all xml files in the given directory.
	This is very basic; open-close pairs and tags with different attributes will be treated as different.
	eg, <foo name="bar"> will be treated as a different tag from <foo name="baz">,
		and <foo> will be treated as a different tag from </foo>
	"""
	xml_files = list(Path(directory).rglob("*.[xX][mM][lL]")) # Get a list of all xml files in the path recursively
	tag_pattern = re.compile(r"(?<=<)(.*?)((?= \/>)|(?=>))")  # Regex to find things that look like XML tags

	all_tags = set()

	for filename in xml_files:
		with open(filename, "r", encoding='utf-8') as f:
			text = f.read()
			results = tag_pattern.findall(text)
			for tag in results:
				if tag not in all_tags:
					all_tags.add(tag[0])

	return all_tags

def process_tags(all_tags):
	"""
	Identifies two things about each tag:
	- Is it matched or unmatched?
	- Does it have attributes, and if so, what are they named?
	"""

	# Find tags with attributes
	# We need to do this first, because otherwise the match detection won't work
	# eg, <foo name="bar"> will not look like a match with </foo>
	tag_attr_index = {}
	attr_tags = set()
	no_attr_tags = set()
	pruned_tags = set()

	attr_pattern = re.compile(r" (.+?)=")
	for tag in all_tags:
		if "=" in tag:
			# Figure out what the attributes are and insert them into the index
			parts = tag.split(" ")
			base_tag = parts[0]
			attrs = attr_pattern.findall(tag)
			if not base_tag in tag_attr_index: # It's a new tag; add it to the index
				tag_attr_index[base_tag] = attrs
			else: # It's an old tag; check if we have any attrs that aren't there already
				for attr in attrs:
					if attr not in tag_attr_index[base_tag]:
						tag_attr_index[base_tag].append(attr)
			# Then, add the tag itself (without attributes) to the relevant sets
			attr_tags.add(base_tag)
			pruned_tags.add(base_tag)
		else:
			no_attr_tags.add(tag)
			pruned_tags.add(tag)

	# Partition into matched/unmatched pairs
	unmatched_tags = set()
	matched_tags = set()

	for tag in pruned_tags:
		if tag[0] == "/":
			# Closing tag means it's a matched tag
			matched_tags.add(tag[1:])
			unmatched_tags.discard(tag[1:])
		else:
			# Not a closing tag; check if we already know it's matched, and if not, add it to unmatched
			# If it turns out to be a matched tag, it will be removed later when we see the closing tag
			if not tag in matched_tags:
				unmatched_tags.add(tag)

	return (tag_attr_index, unmatched_tags, matched_tags)

if __name__ == "__main__":
	all_tags = find_all_tags_in_directory(DIRECTORY)
	(tag_attr_index, unmatched, matched) = process_tags(all_tags)
	print("Tags with attributes:")
	for i in tag_attr_index:
		print("\t" + i + ": ", end="")
		print(tag_attr_index[i])
	print("Unmatched tags:")
	for i in unmatched:
		print("\t" + i)
	print("Matched tags:")
	for i in matched:
		print("\t" + i)
