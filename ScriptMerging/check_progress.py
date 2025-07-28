import sys
import os
import xml.etree.ElementTree as EX


def main(file):
    error_file = os.path.join(os.getcwd(), "untranslated.txt")
    #merged_file = os.path.join(os.getcwd(), "current_merged", file)
    merged_file = os.path.join(os.getcwd(), "locationated", file)
    tree = EX.parse(merged_file)
    sjis_nodes = tree.findall(".//sjis")
    ascii_nodes = tree.findall(".//ascii")
    if len(sjis_nodes) != len(ascii_nodes):
        print(len(sjis_nodes), len(ascii_nodes))
        with open(error_file, 'a', encoding="utf-8") as fw:
            fw.write(file + "\n")
            fw.write("SJIS:\t" + str(len(sjis_nodes)) + "\n")
            fw.write("ASCII:\t" + str(len(ascii_nodes)) + "\n\n")
        os.rename(merged_file, os.path.join(os.getcwd(), "locationated", "problem", file))
        #input()
    print(file)


if __name__ == "__main__":
    print(sys.argv[1])
    main(sys.argv[1])