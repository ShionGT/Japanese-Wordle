import stat, os
import re

def process_line(line: str) -> list[str]:
    lines = line.split("<br />")
    katakana_pattern = r"[ァ-ンｧ-ﾝﾞﾟ]"
    i = 0
    while i < len(lines):
        lines[i] = lines[i].strip().replace("<p>", "").replace("</p>", "")
        if len(lines[i]) > 10:
            lines.pop(i)
        elif not '｜' in lines[i] or '[' in lines[i] or ']' in lines[i]:
            lines.pop(i)
        elif re.search(katakana_pattern, lines[i]):
            lines.pop(i)
        else:
            i += 1
    return lines

def extract_words(file: str)-> list[str]:
    lines = ['']
    # print('Reading file in ' + file)
    i = 0
    with open(file, 'r') as txt:
        lines += txt.readlines()
        while i < len(lines):
            if not lines[i] or lines[i] == '' or lines[i] == '\n':
                lines.pop(i)
            elif '</styles>' in lines[i]:
                lines = lines[i:]
                i = 0
            elif not '<p>' in lines[i]:
                lines.pop(i)
            elif '<footer>' in lines[i]:
                lines = lines[:i]
                break
            else:
                i += 1
    i = 0
    while i < len(lines):
        lines[i] = process_line(lines[i])
        if len(lines[i]) < 1:
            lines.pop(i)
            continue
        i += 1
    # print('extract_words(): ' + str(lines))
    return lines

def organize_words_to_map(words_array: list[str]) -> dict[str, list[str]]:
    words_array.sort()
    dicc = {}
    for i in range(len(words_array)):
        word_header = ""
        for j in range(len(words_array[i])):
            if words_array[i][j] in dicc.values():
                continue
            if word_header in dicc:
                dicc[word_header] += [words_array[i][j]]
            else:
                word_header = "katakana_data_" + str(words_array[i][j][0]) + "行"
                dicc[word_header] = [words_array[i][j]]
    return dicc


wordle_list = extract_words("output/output.html")
wordle_dict = organize_words_to_map(wordle_list)

for letter, words in wordle_dict.items():
    json_str = "["
    # file location
    out_file = f'output/{letter}.json'
    print("\n\nOutput file: " + out_file)
    #check if file exists or not
    if os.path.exists(out_file):
        # make the file readable and writeable if exists
        os.chmod(out_file, stat.S_IREAD | stat.S_IWRITE)

    for i in range(len(words)):
        if i > 0:
            json_str += ','
        json_str += '\n{'
        # print("one line of words[i] in main: " + str(words[i]))
        special_char_pattern = r"[ \[\]'\"\\/?><]"
        word_div = re.sub(special_char_pattern, '', str(words[i])).split('｜')
        kana = word_div[0]
        word = word_div[-1]
        json_str += '\n' + f'  "kana": "{kana}",\n   "word": "{word}"'
        json_str += '\n}'
    json_str += '\n]'

    # start writing the file
    with open(out_file, "w") as f:
        f.write(json_str)
