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


def insert_current_translation(file):
    sjis_file = os.path.join(os.getcwd(), "original_sjis_only", file)
    translated_file = os.path.join(os.getcwd(), "current_translation", file)
    sjis_tree = EX.parse(sjis_file)
    translation_tree = EX.parse(translated_file)
    r1 = sjis_tree.getroot()
    r2 = translation_tree.getroot()

    def get_node(element: EX.Element):
        if element.tag == "dialogue":
            for e in element:
                if e.tag == "male":
                    yield e
                if e.tag == "female":
                    yield e
            else:
                yield element
        elif element.tag == "location":
            yield element
        elif element.tag == "menu":
            for e in list(element):
                if e.tag == "option":
                    yield e
                elif e.tag == "title":
                    yield e
                else:
                    # big print easier to see in console
                    print("NONONONONONONONONONONONONONONONONONO  menu " + e.tag)
                    input()
        elif element.tag == "popup":
            yield element
        elif element.tag == "bigtext":
            yield element
        elif element.tag == "choice":
            for e in list(element):
                if e.tag == "male":
                    if e.find("option"):
                        yield e.find("option")
                    elif e.find("sjis"):
                        yield e
                elif e.tag == "female":
                    if e.find("option"):
                        yield e.find("option")
                    elif e.find("sjis"):
                        yield e
                elif e.tag == "info":
                    pass
                elif e.tag == "portrait_l":
                    pass
                elif e.tag == "portrait_r":
                    pass
                elif e.tag == "option":
                    yield e
                else:
                    # big print easier to see in console
                    print("NONONONONONONONONONONONONONONONONONO choice  " + e.tag)
                    input()
        else:
            # big print easier to see in console
            print("NONONONONONONONONONONONONONONONONONO else  " + element.tag)
            input()

    def handle(element: EX.Element):
        sjis = element.find("sjis")
        r1_sjis = ""
        r1_single_tag = False
        if sjis is not None:
            r1_sjis = ''.join(x.strip("\n\t ") for x in sjis.itertext())
            r1_sjis = (r1_sjis
                       .replace("～", "")
                       .replace("〜", "")
                       .replace("「", "")
                       .replace("」", "")
                       )
            if r1_sjis == "" and len(list(sjis)) > 0:
                r1_single_tag = True
        if r1_sjis != "" or r1_single_tag:
            for f in list(r2):
                for e in get_node(f):
                    if e is not None:
                        sjis2 = e.find("sjis")
                        r2_sjis = ""
                        r2_single_tag = False
                        if sjis2 is not None:
                            r2_sjis = ''.join(x.strip("\n\t ") for x in sjis2.itertext())
                            r2_sjis = (r2_sjis
                                       .replace("～", "")
                                       .replace("〜", "")
                                       .replace("「", "")
                                       .replace("」", "")
                                       )
                            if r2_sjis == "" and len(list(sjis2)) > 0:
                                r2_single_tag = True
                            if r1_sjis == r2_sjis and (r1_single_tag == r2_single_tag):
                                ascii_node = e.find("ascii")
                                if ascii_node is not None:
                                    asc = ""
                                    for y in e:
                                        if y.text is not None and y.text != "":
                                            asc += y.text
                                        for ref in y:
                                            asc += "<" + ref.tag + " />"
                                    element.append(ascii_node)
                                    return

    for d in list(r1):
        for e in get_node(d):
            if e is not None:
                handle(e)
    
    ff = os.path.join(os.getcwd(), "current_merged", file)
    sjis_tree.write(ff, encoding='utf-8')
    indent(ff)
    #input()


if __name__ == "__main__":
    print(sys.argv[1])
    insert_current_translation(sys.argv[1])
