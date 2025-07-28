import csv
import sys
import os
import xml.etree.ElementTree as EX


def indent(file):
    lines = []
    with open(file, 'r', encoding="utf-8") as fr:
        for l in fr:
            lines.append(l.strip("\n\t "))
    level = 0
    new_lines = []
    for line in lines:
        level -= line.count("</")
        new_line = "\t" * level + line + "\n"
        new_lines.append(new_line)
        level += line.count("<")
        level -= line.count("</")
        level -= line.count("/>")
    with open(file, 'w', encoding="utf-8") as fw:
        for li in new_lines:
            fw.write(li)


def auto_locate(file):
    translated_file = os.path.join(os.getcwd(), "current_merged", file)
    tree = EX.parse(translated_file)
    root = tree.getroot()

    LOCATIONS = {}
    with open('locations.csv', mode='r', encoding="utf-8") as infile:
        reader = csv.reader(infile)
        LOCATIONS = {rows[0]:rows[1] for rows in reader}

    def translate_location(element: EX.Element):
        loc = element.find("sjis").text.strip()
        if loc in LOCATIONS.keys():
            asc = EX.Element("ascii")
            asc.text = "\n" + LOCATIONS[loc]
            asc.tail = "\n"
            end = EX.Element("end_line")
            end.tail = "\n"
            asc.append(end)
            element.append(asc)
        else:
            print(loc)
            #input()

    for element in list(root):
        if element.tag == "location" and element.find("ascii") is None:
            translate_location(element)
    
    ff = os.path.join(os.getcwd(), "locationated", file)
    tree.write(ff, encoding='utf-8')
    indent(ff)


if __name__ == "__main__":
    print(sys.argv[1])
    auto_locate(sys.argv[1])
