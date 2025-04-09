import xml.etree.ElementTree as etree
from pathlib import Path
import re
import os

ISCRIPT_DIRECTORY  = "iscripts\\"
JESCRIPT_DIRECTORY = "jescripts_valid\\"
OUTPUT_DIRECTORY   = "output_valid\\"

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

def create_fixed_jescript_file(output_path, xml_tree, location_translations):
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
		#TODO: Fix indentation of ascii tag
		translation = etree.SubElement(location, "ascii")
		translation.text = translated_name

	os.makedirs(os.path.dirname(output_path), exist_ok=True)
	with open(output_path, "wb") as o:
		o.write( etree.tostring(xml_tree.getroot(), encoding="utf-8") ) 

if __name__ == "__main__":
	xml_files = list(Path(JESCRIPT_DIRECTORY).rglob("*.[xX][mM][lL]")) # Get a list of all xml files in the path recursively

	for filepath in xml_files:
		print("Processing " + str(filepath) + "...")
		jescript_name  = os.path.basename(filepath)
		iscript_name = jescript_name[-11:-4] + ".txt"  # All of the iscript names are 7 hex digits plus ".txt"
		input_directory = str(os.path.dirname(filepath))
		output_path = str(filepath).replace(JESCRIPT_DIRECTORY, OUTPUT_DIRECTORY, 1) # Only modify the first occurrence, to prevent errors like /Foo/Foo/ -> /Bar/Bar/
		
		try:
			locations = get_locations_from_iscript(ISCRIPT_DIRECTORY + iscript_name)
		except:
			print("!!!!! iscript not found: " + iscript_name)
		xml_tree = get_xml_tree_from_jescript(filepath)

		create_fixed_jescript_file(output_path, xml_tree, locations)