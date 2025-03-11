import xml.etree.ElementTree as etree
import re

# ISCRIPT_DIRECTORY  = ""
# JESCRIPT_DIRECTORY = ""
# OUTPUT_DIRECTORY   = ""

test_iscript  = "test-iscript-176029c.txt"
test_jescript = "test-input-176029c.xml"
test_output   = "test-output-176029c.xml"

def get_locations_from_iscript(filename):
	with open(filename, "r", encoding="utf-8") as f:
		iscript = f.read()
		# It might be marginally faster to compile this in advance, but to see gains we'd need to do it as a global
		# That would still be faster, but it doesn't really matter, and it's much uglier
		location_translations = re.findall(r"placetxt\s+?\"(.+)\"", iscript)

	return location_translations

def get_xml_tree_from_jescript(filename):
	with open(filename, "r", encoding="utf-8") as f:
		xml_tree = etree.parse(f)

	return xml_tree

def create_fixed_jescript_file(filename, xml_tree, location_translations):
	print("Processing " + filename + "...")
	for location in xml_tree.getroot().findall("location"):
		# Get the Japanese version of the location name
		# sjis = location.find("sjis")
		# print(sjis.text.strip())
		try:
			translated_name = location_translations.pop(0)
		except:
			# We assume that the paired iscript will have the same number of locations
			# If not, something has gone very wrong!
			print("!!!!! Ran out of locations in the iscript!")
			return

		# Insert the translated version of the location as a new tag
		translation = etree.SubElement(location, "ascii")
		translation.text = translated_name

	with open(filename, "wb") as o:
		o.write( etree.tostring(xml_tree.getroot(), encoding="utf-8") ) 

if __name__ == "__main__":
	locations = get_locations_from_iscript(test_iscript)
	xml = get_xml_tree_from_jescript(test_jescript)
	create_fixed_jescript_file(test_output, xml, locations)