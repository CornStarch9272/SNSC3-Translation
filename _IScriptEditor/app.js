
const filenameHeader = document.getElementById('filename-display');
// #region Button references and event listeners
// Reference to buttons
const openBtn = document.getElementById('open-button');
const saveBtn = document.getElementById('save-button');
const toggleJpBtn = document.getElementById('toggle-jp-button');
const toggleCodeBtn = document.getElementById('toggle-code-button');
const specialCharactersBtn = document.getElementById('special-characters-button');
const aboutBtn = document.getElementById('about-button');
const daySelector = document.getElementById('day-selector');
const chapterSelector = document.getElementById('chapter-selector');
const loadBtn = document.getElementById('load-button');
const findRplceBtn = document.getElementById('find-replace-button');
const replaceAllBtn = document.getElementById('replace-files-button');

// Folders for find and replace
const FindAndRepFolders = ["Day 00", "Day 01", "Day 02", "Day 03", "Day 04", "Day 05", "Day 06", "Day 07", "Day 08", "Day 09", "Day 10", "Final Day", "Post Game"];

const openJsonBtn = document.getElementById('open-json-button');
const saveJsonBtn = document.getElementById('save-json-button');
// Event listeners for buttons
findRplceBtn.addEventListener('click', findReplace);
openBtn.addEventListener('click', readFile);
saveBtn.addEventListener('click', saveFile);
toggleJpBtn.addEventListener('click', toggleJp);
toggleCodeBtn.addEventListener('click', toggleCode);
specialCharactersBtn.addEventListener('click', showSpecialCharacters);
aboutBtn.addEventListener('click', showAbout);
daySelector.addEventListener('change', loadDay);
loadBtn.addEventListener('click', loadChapter);

openJsonBtn.addEventListener('click', readJsonFile);
saveJsonBtn.addEventListener('click', saveJsonFile);
// #endregion

// Variables to hold file data
let enFilename = '';
let jpFilename = '';
let jpText = [];
let engCodeFile = '';
let hideCode = true;
let hideJp = true;
let jsonText = '';
let jsonData = null;
let unsavedJson = false;

// #region conversation variables
// Variables for tracking speaker
let speakerLeft = "NONE";
let speakerRight = "NONE";
let speakerLeftOn = false;
let speakerRightOn = false;
// Variables for tracking player gendered dialogue
const MALE = "MALE";
const FEMALE = "FEMALE";
const BOTH = "BOTH";
let genderTrigger = "NONE";
let endGenderTrigger = "NONE";
let gender = "BOTH";
// Variable for tracking partner dialogue
let partnerChanged = false;
let partnerTrigger = "NONE";
let endPartnerTrigger = "NONE";
let rundorEnd = "NONE";
let enziEnd = "NONE";
let killfithEnd = "NONE";
let rufeelEnd = "NONE";
let partner = -1;
// #endregion

const TOTAL_SPACE = 216;

let DAYS_LOADED = false;
let CHAPTERS_LOADED = false;

// #region Github stuff
const GithubDetails = {
    repo: 'SNSC3-Translation',
    owner: 'CornStarch9272',
    ref: 'IScript-Development',
};

const ignoredFolders = [
    '.github',
    '_IScriptEditor',
    'script untranslated',
    'system_messages'
];
// #endregion

// #region Maps
const dialogTypes = [
    'dialogtxt',
    'dialogbig',
    'placetxt',
    'menutitle',
    'menutxt',
    'choicetitle',
    'choicetxt',
    'popuptxt',
    'setname'
]

const names = {
    0:"Player",
    2:"Partner",
    106:"???",
    107:"Murno",
    108:"V.E",
    109:"Tier",
    110:"Lemmy",
    111:"Bostaph",
    112:"Velvoren",
    113:"Thus",
    114:"Roche",
    115:"Pike",
    116:"Gillan",
    117:"V.E Otome Mode",
    118:"Gatekeeper",
    119:"Chief",
    120:"Man",
    121:"Woman",
    122:"Elderly",
    123:"Child",
    124:"Shop Owner",
    125:"Shop Clerk",
    126:"Merchant",
    127:"Reception",
    128:"Rob",
    129:"Wellman",
    130:"Ianna",
    131:"Zakk",
    132:"Jade",
    133:"Benson",
    134:"Anise",
    135:"Tram",
    136:"Gallahan",
    137:"Serge",
    138:"Eliez",
    141:"Phantom Dragon",
    142:"Magdrad",
    143:"Archer Girl",
    144:"Stray Cat",
    145:"Catlover",
    146:"Fisherman",
    147:"Lumberjack",
    148:"Peddler",
    149:"Peddler's Daughter",
    150:"Wantedman",
    151:"Jailer",
    152:"Zenichi",
    153:"Zenji",
    154:"Zenzou",
    155:"Zentatsu"
};

const TAGS = {
    "[NAME 0]" : "#PlayerName",
    "[NAME 1]" : "#PartnerName",
    "[NAME 2]" : "#PlayerNickname",
    "[NAME 4]" : "#ItemName",
    "..." : "…",
    "   " : "　",
    "—" : "--",
    "◎" : "#Heart",
    "∞" : "#Paw",
    "●" : "#Dot"
}

const BAD_TAGS = {
    "ã" : "　",
    "â¦" : "…",
    "â" : "#Heart",
    "Î²" : "#PlayerName",
    "Î´" : "#PlayerNickname",
    "Î³" : "#PartnerName",
    "Î¶" : "#ItemName",
}

const TAG_LENGTH = {
    "#PlayerName": 72,
    "#PlayerNickname": 72,
    "#PartnerName": 72,
    "[NAME 0]": 72,
    "[NAME 1]": 72,
    "[NAME 2]": 72,
    "[NAME 4]" : 72,
    "◎" : 12,
    "∞" : 12,
    "●" : 12
};

const CHARACTER_SPACE = {
    "!": 3,
    "\"": 7,
    "#": 8,
    "$": 7,
    "%": 8,
    "&": 8,
    "'": 3,
    "(": 6,
    ")": 6,
    "*": 8,
    "+": 8,
    ",": 3,
    "-": 6,
    ".": 3,
    "/": 8,
    "0": 6,
    "1": 5,
    "2": 6,
    "3": 6,
    "4": 6,
    "5": 6,
    "6": 6,
    "7": 6,
    "8": 6,
    "9": 6,
    "A": 6,
    "B": 6,
    "C": 6,
    "D": 6,
    "E": 6,
    "F": 6,
    "G": 6,
    "H": 6,
    "I": 4,
    "J": 6,
    "K": 6,
    "L": 6,
    "M": 6,
    "N": 6,
    "O": 6,
    "P": 6,
    "Q": 7,
    "R": 6,
    "S": 6,
    "T": 6,
    "U": 6,
    "V": 6,
    "W": 6,
    "X": 6,
    "Y": 6,
    "Z": 6,
    "a": 6,
    "b": 6,
    "c": 6,
    "d": 6,
    "e": 6,
    "f": 6,
    "g": 6,
    "h": 6,
    "i": 4,
    "j": 5,
    "k": 5,
    "l": 4,
    "m": 6,
    "n": 6,
    "o": 6,
    "p": 6,
    "q": 6,
    "r": 6,
    "s": 6,
    "t": 6,
    "u": 6,
    "v": 6,
    "w": 6,
    "x": 6,
    "y": 6,
    "z": 6,
    ":": 3,
    ";": 4,
    "<": 7,
    "=": 8,
    ">": 7,
    "?": 6,
    "{": 5,
    "}": 5,
    "^": 6,
    "~": 10,
    "…": 9,
    "_": 6,
    " ": 4,
    "—": 12,
    "　": 12,
    "\\": 12,
}
// #endregion

let DIRTY = false;


async function mainSetup() {
    const octoModule = await import("https://esm.sh/octokit");
    const octokit = new octoModule.Octokit();
    let days = [];
    octokit.rest.repos.getContent(GithubDetails).then(response => {
        for (let item of response.data) {
            if (item.type === 'dir') {
                days.push(item.name);
            }
        }
        daySelector.innerHTML = '';
        for (let day of days) {
            if (day == 'script untranslated' || day == 'system_messages') continue;
            let option = document.createElement('option');
            option.value = day;
            option.innerHTML = day;
            daySelector.appendChild(option);
        }
        DAYS_LOADED = true;
        loadDay();
    });
}

/**
 * Read IScript file and process its contents
 */
function readFile() {
    // Get file input element and trigger click
    const openFileInput = document.getElementById('open-file-input');
    openFileInput.click();
    // Handle file being selected / changed
    openFileInput.onchange = e => {
        const file_ = e.target.files[0];
        let filename = file_.name;
        const reader = new FileReader();
        reader.onload = event => {
            const text = event.target.result;
            engCodeFile = text;
            readJPFile().then(() => {
                processText();
            });
            enFilename = filename;
            filenameHeader.textContent = "Editing: " + enFilename;
        }
        reader.readAsText(file_,'UTF-8');
    }
}


async function loadDay() {
    if (!DAYS_LOADED) return;
    CHAPTERS_LOADED = false;
    const octoModule = await import("https://esm.sh/octokit");
    const octokit = new octoModule.Octokit();
    let chapters = [];
    octokit.rest.repos.getContent({
        owner: 'CornStarch9272',
        repo: 'SNSC3-Translation',
        ref: 'IScript-Development',
        path: daySelector.value,
    }).then(response => {
        for (let item of response.data) {
            if (item.type === 'file') {
                chapters.push(item.name);
            }
        }
        chapterSelector.innerHTML = '';
        for (let chapter of chapters) {
            let option = document.createElement('option');
            option.value = chapter;
            option.innerHTML = chapter;
            chapterSelector.appendChild(option);
        }
        CHAPTERS_LOADED = true;
    });
}

async function loadChapter() {
    if (!DAYS_LOADED) return;
    if (!CHAPTERS_LOADED) return;
    if (DIRTY) {
        if (!confirm("Are you sure? You have unsaved changes that will be lost.")) {
            return;
        }
    }
    const octoModule = await import("https://esm.sh/octokit");
    const octokit = new octoModule.Octokit();
    await octokit.rest.repos.getContent({
        owner: 'CornStarch9272',
        repo: 'SNSC3-Translation',
        ref: 'IScript-Development',
        path: daySelector.value + '/' + chapterSelector.value,
    }).then(async response => {
        enFilename = chapterSelector.value;
        const decoder = new TextDecoder('utf-8');
        const content = atob(response.data.content);
        const data = new Uint8Array(content.length);
        for (let i = 0; i < content.length; i++) {
            data[i] = content.charCodeAt(i);
        }
        engCodeFile = decoder.decode(data);
        await readJPFile();
        filenameHeader.textContent = "Editing: " + enFilename;
    });
    DIRTY = false;
    resetPreviousSpeaker();
    checkProcessText();
}


async function readJPFile() {
    const octoModule = await import("https://esm.sh/octokit");
    const octokit = new octoModule.Octokit();
    let splits = enFilename.split('_');
    let jpScriptPath = splits[splits.length - 1];
    await octokit.rest.repos.getContent({
        owner: 'CornStarch9272',
        repo: 'SNSC3-Translation',
        ref: 'IScript-Development',
        path: 'script untranslated' + '/' + jpScriptPath,
    }).then(response => {
        const decodedText = new TextDecoder().decode(
            Uint8Array.from(atob(response.data.content), c => c.charCodeAt(0))
            );
        let x = getThatJP(decodedText);
        jpText = x;
    });
}


function checkProcessText() {
    if (engCodeFile != '') {
        processText();
    }
}


/**
 * Save the edited contents back to a file
 */
function saveFile() {
    let saveFile = document.createElement('a');
    // Extract text from the relevant elements
    let txt = extractText();
    Object.keys(TAGS).forEach(element => {
        if (element == "   ") return;
        txt = txt.replaceAll(TAGS[element], element);
    });

    saveFile.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(txt));
    saveFile.setAttribute('download', enFilename);    

    // Makes this element invisible
    saveFile.style.display = 'none';
    document.body.appendChild(saveFile);
    // Executes the download
    saveFile.click();
    document.body.removeChild(saveFile);
    DIRTY = false;
}

/**
 * Extract text from the relevant elements
 * @returns string
 */
function extractText() {
    let text = '';
    let divCounter = 0;
    // All relevant elements have numerical IDs starting from 0
    while (true) {
        let div = document.getElementById(divCounter);
        if (div == null) break;
        // Elements with textareas have both code and dialogue that are processed differently
        if (div.classList.contains('has-text')) {
            let codeArea = div.getElementsByClassName('code-area')[0];
            let dialogArea = div.getElementsByClassName('contains-text')[0];
            let codeLines = codeArea.textContent.split('\n');
            let dialogueLines = dialogArea.textContent.split('\n');
            // Merge code and dialogue lines appropriately
            for (let i = 0; i < codeLines.length; i++) {
                if (i+1 < codeLines.length && clearCode(codeLines[i]) && clearCode(codeLines[i+1])) {
                    continue;
                }
                if (i == codeLines.length - 1 && clearCode(codeLines[i]) && !div.classList.contains('ends-with-clearcode')) {
                    // Skip final clear code if it was added automatically
                    continue;
                }                
                text += codeLines[i];
                // Only add dialogue if it exists for that line
                // Lines with clearcodes don't have dialogue
                if (i < dialogueLines.length && dialogueLines[i] != '') {
                    let line = dialogueLines[i];
                    line = line.replaceAll('\\', '');
                    line = line.replaceAll('"', '\\"');
                    text += '"' + line + '"\n';
                }
                else
                    text += '\n';
                if (i == codeLines.length - 1 && !clearCode(codeLines[i]) && div.classList.contains('ends-with-clearcode')) {
                    // Add final clear code if it was removed
                    let clearType = '';
                    for (let j = 0; j < codeLines.length; j++) {
                        let line = codeLines[j];
                        if (clearCode(line)) {
                            clearType = line;
                            break;
                        }
                    }
                    if (clearType == '') clearType = 'code0309\t';
                    text += clearType + '\t\n';
                }
            }
        }
        // All other elements just contain unedited code lines
        else
            text += div.textContent + '\n';
        divCounter += 1;
    }
    return text;
}

/**
 * Toggle code visibility on and off from button
 */
function toggleCode() {
    hideCode = !hideCode;
    hideCodeElements();
}

function toggleJp() {
    //if (jpText.length == 0) jpText = getThatJP(engCodeFile);
    //if (jpText.length == 0) return;
    hideJp = !hideJp;
    hideJpElements();
}

/**
 * Actually toggles visibility of code elements
 */
function hideCodeElements() {
    let hideables = document.querySelectorAll(".hideable")
    hideables.forEach(function(element) {
        if (hideCode) {
            element.style.display = "none";
        } else {
            element.style.display = "";
        }
    });
}

function hideJpElements() {
    let hideables = document.querySelectorAll(".hideable-jp")
    hideables.forEach(function(element) {
        if (hideJp) {
            element.style.display = "none";
        } else {
            element.style.display = "";
        }
    });
}

/**
 * Process each line of the stored text and create appropriate HTML elements
 */
function processText() {
    const dFrag = document.createDocumentFragment();
    // Clear existing content
    document.getElementById('content').innerHTML = '';    
    let storedLines = [];
    let prevLineType = "";
    let divCounter = 0;
    let counter2 = 0;
    let lines = engCodeFile.split('\n');
    for (let lineNum in lines) {
        let line = lines[lineNum];
        let currentLineType = line.split(' ')[0];
        if (prevLineType === "" ) prevLineType = currentLineType;
        // Typically means a switch between lines of text and lines of code
        if (currentLineType !== prevLineType || prevLineType.startsWith('menut') || prevLineType.startsWith('choicet')) {
            // Clear codes are grouped with text
            //if (clearCode(currentLineType) && prevLineType != 'dialogbig') {
            if (clearCode(currentLineType)) {
                storedLines.push(line);
                // To keep previous line type the same
                continue;
            }
            // Stored lines have some kind of dialog
            else if (textCode(prevLineType) != "NONE") {
            //if (textCode(prevLineType)) {
                let speakerElement = document.createElement('p');
                // Display name of active speaker(s)
                if (speakerLeftOn && speakerRightOn) {
                    speakerElement.textContent = "BOTH: " + speakerLeft + " / " + speakerRight;
                }
                else if (speakerLeftOn) {
                    speakerElement.textContent = speakerLeft;
                }
                else if (speakerRightOn) {
                    speakerElement.textContent = speakerRight;
                }
                else {
                    if (prevLineType.startsWith('menutitle'))
                        speakerElement.textContent = "MENU PROMPT";
                    else if (prevLineType.startsWith('menutxt'))
                        speakerElement.textContent = "MENU OPTION";
                    else if (prevLineType.startsWith('choicetxt'))
                        speakerElement.textContent = "DIALOGUE OPTION";
                    else if (prevLineType.startsWith('popuptxt'))
                        speakerElement.textContent = "POPUP TEXT";
                    else
                        speakerElement.textContent = "NO SPEAKER";
                }
                // Indicate whether this line is based on player gender
                if (gender == "MALE") {
                    speakerElement.textContent += " (PLAYER IS MALE)";
                }
                else if (gender == "FEMALE") {
                    speakerElement.textContent += " (PLAYER IS FEMALE)";
                }

                switch(partner) {
                    case 0:
                        speakerElement.textContent += " (RUN-DOR)";
                        break;
                    case 1:
                        speakerElement.textContent += " (ENZI)";
                        break;
                    case 2:
                        speakerElement.textContent += " (KILLFITH)";
                        break;
                    case 3:
                        speakerElement.textContent += " (RUFEEL)";
                        break;
                    default:
                        // Do nothing
                        break;
                }

                let parentDiv = document.createElement('div');
                parentDiv.id = divCounter;

                let codeLines = [];
                let dialogueLines = [];
                let charCountLines = [];
                // It's a text area for symmetry reasons
                let codeArea = document.createElement('textarea');
                // So that code area is not editable
                codeArea.disabled = true;
                let jpArea = document.createElement('textarea');
                jpArea.disabled = true;
                
                let charCountArea = document.createElement('textarea');
                charCountArea.disabled = true;
                for (const x in storedLines) {
                    let splits = storedLines[x].split('"');
                    codeLines.push(splits[0]);
                    if (splits.length > 1) {
                        if (splits.length > 3) {
                            let temp = splits.slice(1).join('"');
                            temp = temp.slice(0, temp.length - 1);
                            dialogueLines.push(temp);
                        }
                        else
                            dialogueLines.push(splits[1]);
                        charCountLines.push(Array.from(splits.slice(1).join('"')).length);
                    }
                    else {
                        dialogueLines.push('');
                        charCountLines.push(0);
                    }
                }
                if (jpText.length > 0)
                    jpArea.textContent = jpText[counter2];
                counter2 += 1;
                codeArea.textContent = codeLines.join('\n');
                
                charCountArea.textContent = charCountLines.join('\n');
                // Set classes for code area
                codeArea.classList.add('hideable');
                codeArea.classList.add('code-area');
                codeArea.classList.add('text-right');
                // Set classes for JP area
                jpArea.classList.add('jp-area');
                jpArea.classList.add('hideable-jp');
                // Set classes for dialogue area
                
                // Set classes for character count area
                charCountArea.classList.add('charcount-textarea');                

                parentDiv.appendChild(codeArea);
                parentDiv.appendChild(jpArea);                
                
                let dialogArea = document.createElement('textarea');
                // Additional classes for dialogue area based on type of dialog
                let type = textCode(prevLineType);
                dialogArea.classList.add(type);
                charCountArea.classList.add(type);

                parentDiv.appendChild(dialogArea);
                parentDiv.appendChild(charCountArea);
                // Extra classes for player gender
                if (gender == "MALE") {
                    dialogArea.classList.add('maletxt');
                    if (dialogArea.classList.contains('femaletxt'))
                        dialogArea.classList.remove('femaletxt');
                    if (dialogArea.classList.contains('bothgenders'))
                        dialogArea.classList.remove('bothgenders');
                }
                else if (gender == "FEMALE") {
                    dialogArea.classList.add('femaletxt');
                    if (dialogArea.classList.contains('maletxt'))
                        dialogArea.classList.remove('maletxt');
                    if (dialogArea.classList.contains('bothgenders'))
                        dialogArea.classList.remove('bothgenders');
                }
                else if (gender == "BOTH") {
                    dialogArea.classList.add('bothgenders');
                    if (dialogArea.classList.contains('maletxt'))
                        dialogArea.classList.remove('maletxt');
                    if (dialogArea.classList.contains('femaletxt'))
                        dialogArea.classList.remove('femaletxt');
                }
                dialogArea.textContent = dialogueLines.join('\n');
                dialogArea.classList.add('contains-text');
                if (clearCode(codeLines[codeLines.length - 1]))
                    parentDiv.classList.add('ends-with-clearcode');
                parentDiv.classList.add('multiline');
                parentDiv.classList.add('flex');
                parentDiv.classList.add('has-text');
                dFrag.appendChild(speakerElement);
                dFrag.appendChild(parentDiv);
            }
            // Everything else is just code
            else {
                let div = document.createElement('div');
                div.id = divCounter;
                div.classList.add('multiline');
                div.classList.add('codetext');
                div.classList.add('hideable');
                div.textContent = storedLines.join('\n');
                dFrag.appendChild(div);
            }
            prevLineType = currentLineType;
            storedLines = [line];
            divCounter += 1;            
        }
        // Same kind of lines being stored
        else {
            storedLines.push(line);
        }
        // Process any code that affects speakers
        processCode(lines, line);
    }
    document.getElementById('content').appendChild(dFrag);
    setTextareaEvents();
    hideJpElements();
    hideCodeElements();
}

function findReplace() {
    //setting up new screen
    const dFrag = document.createDocumentFragment();
    let parentDiv = document.createElement('div');
    parentDiv.style = "text-align: center;";
    //wipe screen
    document.getElementById('content').innerHTML = '';  
   
    //create new elements
    let speakerElement = document.createElement('p');
    let findLabel = document.createElement('p');
    let replaceLabel = document.createElement('p');
    let findBox = document.createElement('textarea');
    let replaceBox = document.createElement('textarea');
    let replaceButton = document.createElement('button');
    let findButton = document.createElement('button');
    let folderSelect = document.createElement('select');
    let capitalSelect = document.createElement('select');
    let filler = document.createElement('p');
    let test = document.createElement('p');

    //Add every day folder and post game as first option to be looped over in option select
    let option = document.createElement('option');
    option.value = FindAndRepFolders;
    option.innerHTML = "All Text Folders";
    folderSelect.appendChild(option);

    //After that add every individual folder for the days and post game as an option
    for (folder of FindAndRepFolders) {
        option = document.createElement('option');
        option.value = [folder];
        option.innerHTML = folder;
        folderSelect.appendChild(option);
    }

    option = document.createElement('option');
    option.value = false;
    option.innerHTML = "One to One";
    capitalSelect.appendChild(option);
    option = document.createElement('option');
    option.value = true;
    option.innerHTML = "All Types of Capitalization";
    capitalSelect.appendChild(option);
   
    //make labels and names for buttons
    speakerElement.textContent = "Find and Replace a Word in all txt Files";
    findLabel.textContent = "find";
    replaceLabel.textContent = "replace";
    replaceButton.textContent = "Replace All";
    findButton.textContent = "Find All";

    //style choices for buttons 
    findLabel.style = "display: inline-block; margin: 0 18%; font-size: 18px;";
    replaceLabel.style = "display: inline-block; margin: 0 18%; font-size: 18px";
    findBox.style = "display: inline-block; margin: 0 4%;";
    replaceBox.style = "display: inline-block; margin: 0 4%;";
    test.style = "display: block; font-size: 16px; white-space: pre-wrap;";
    filler.style = "display: block;";

    folderSelect.style = "display: inline-block; margin: 0 1%;";
    capitalSelect.style = "display: inline-block; margin: 0 1%;";
    replaceButton.style = "display: inline-block; margin: 2% 1%; ";
    findButton.style = "display: inline-block; margin: 2% 1%; ";
    
    //make sure replace button calls replaceAllWords on click and append all children to parent div
    replaceButton.addEventListener('click', replaceAllWords);
    findButton.addEventListener('click', findAllWords);
   
    parentDiv.appendChild(speakerElement);
    parentDiv.append(findLabel);
    parentDiv.append(replaceLabel);
    parentDiv.appendChild(findBox);
    parentDiv.appendChild(replaceBox);
    parentDiv.appendChild(folderSelect);
    parentDiv.appendChild(capitalSelect);
    parentDiv.appendChild(filler);
    parentDiv.appendChild(replaceButton);
    parentDiv.appendChild(findButton);
    parentDiv.appendChild(test);    

    async function replaceAllWords() {
        //Our code doesn't have access to the users file system (obviously) so we need to ask them for the path everytime to replace
        const dirHandle = await window.showDirectoryPicker();

        //Make sure there's no problems in the code like an empty find box or [] characters messing with detection of [Name 0] and nametags like it
        if (findBox.value == "") {
            test.textContent = "The find box is empty, fill it in and try again";
            return;
        } else if (findBox.value.includes("[") || replaceBox.value.includes("[")){
            test.textContent = "Your request contains [ which is used in nametag codes thus making it invalid for searches";
            return;
        } else if (findBox.value.includes("]") || replaceBox.value.includes("]")){
            test.textContent = "Your request contains ] which is used in nametag codes thus making it invalid for searches";
            return;
        } else {
            test.textContent = "";
        }

        //puttting the textbox content into two variables for simplicty and less calls to the html
        findKey = findBox.value;
        const findLen = findKey.length;
        console.log(`findLen: ${findLen}`);

        const replaceKey = replaceBox.value;
        const replaceLen = replaceKey.length;
        console.log(`replaceLen: ${replaceLen}`); 
        
        //make a message saying loading and another message to write when replacing is done
        test.textContent = "Loading....";
        finishMessage = "Done\nFiles Modified:\n";

        //loop through all objects in first directory (This directory needs to be SNSC3-Translation)
        for await (const [name, handle] of dirHandle) {
            //first If is text files just in case but second If is for going into all the directories (assuming they are in the users chosen directories)
            if (handle.kind === 'file' && name.slice(-3) == "txt") {
                const file = await handle.getFile();
                const contents = await file.text();
                console.log(`File: ${name}`);

            } else if (handle.kind === 'directory' && folderSelect.value.includes(name)) {
                console.log(`Subfolder: ${name}`);
                //go through every object in the folder and do an If to see if it is a text file
                for await (const [subName, subHandle] of handle) {
                    if (subHandle.kind === 'file' && subName.slice(-3) == "txt") {
                        //get text file contents split them by " to isolate dialog 
                        //also create writeable object to save new file when done
                        const file = await subHandle.getFile();
                        contents = await file.text();
                        
                        const fileHandle = await handle.getFileHandle(subName, { create: true });
                        const writable = await fileHandle.createWritable();

                        dialogs = contents.split('"');
                        //A find trigger for saying when a file has been modified and a length warning trigger for
                        //when the replacement of the find word has made the line's length too long are defaulted to false
                        findFoundTrigger = false;
                        lengthWarnTrigger = false;

                        //loop through every other dialog line because array holds code then dialog line then code then dialog etc
                        for (let diaIndex = 1; diaIndex < dialogs.length; diaIndex += 2) {
                            theLine = dialogs[diaIndex];
                            
                            //while loop to extract every instance of name tags from dialog 
                            //] characters are left in as a marker to reinsert nametags in afterwards
                            //] characters also move index with newly inserted replacement words so it's flexible solution
                            storage = [];
                            nameInd = theLine.indexOf("[");
                            while (nameInd !== -1) {
                                storage.push(theLine.substring(nameInd, nameInd + 7));
                                theLine = theLine.substring(0,nameInd) + theLine.substring(nameInd + 7);
                                nameInd = theLine.indexOf("[", nameInd + 1);
                                console.log(`lineNameInd: ${theLine}`);
                            }
 
                            //if ignore capitals is on set line to all uppercase to ignore capitals
                            findInd = null;
                            getKeyInd = (startInd) => findInd = theLine.indexOf(findKey, startInd);
                            //we have to use == true becasue all html/dom values are strings which is silly but what can ya do
                            if (capitalSelect.value == true) {
                                getKeyInd = (startInd) => findInd = theLine.toUpperCase().indexOf(findKey.toUpperCase(), startInd);
                            } 
                            //first search for find word in dialog
                            //then in the while loop fill it replaceIndexes which every index the key word has been found
                            getKeyInd(0);
                            firstCap = [];
                            replaceIndexes = [];
                            
                            while (findInd !== -1) {
                                //if key word is found and to be replaced turn find trigger true
                                findFoundTrigger = true;
                                replaceIndexes.push(findInd);

                                if (capitalSelect.value == true) {
                                    theFind = theLine.substring(findInd, findInd + findLen);
                                    //debug code here
                                    console.log(`capitalisation analyisis: ${theFind} ${theLine.substring(findInd)}`);

                                    //fill firstCap with every case of captialisation we care about
                                    //all lowercase = 0, ALL CAPS = 1, Noun Capitalization = 2 
                                    //all other cases of capitilization are too complex to react to so we default to 2
                                    //(like how do u keep capitals for changing GrEaTswORd into katana?)
                                
                                    if (theFind == theFind.toLowerCase()) {
                                        firstCap.push(0);
                                    } else if (theFind == theFind.toUpperCase()) {
                                        firstCap.push(1);
                                    } else {
                                        firstCap.push(2);
                                    }
                                }
                                getKeyInd(findInd + 1);
                            }

                            //now we insert the replace word back in we cycle inversely through replace indexes so as to 
                            //not invalidate the next index we need to place the replace word in
                            //for example if we have indexs 2 and 7 for "I liked" if we put a word in and it
                            //becomes "I am liked" index 7 is invalidated should now be index 10 to add something at the end of "liked"
                            for (let index = replaceIndexes.length -1; index >= 0; index --) {
                                repInd = replaceIndexes[index];
                                replace = replaceBox.value;

                                //use pop() for captials array since we are navigating list inversely
                                if (capitalSelect.value == true) {
                                    switch (firstCap.pop()) {
                                        case 0:
                                            replace = replace.toLowerCase();
                                            break; 
                                        case 1:
                                            replace = replace.toUpperCase(); 
                                            break;
                                        case 2:
                                            replace = replace.substring(0,1).toUpperCase() + replace.substring(1); 
                                    }
                                }

                                theLine = theLine.substring(0, repInd) + replace + theLine.substring(repInd + findLen);
                                console.log(`lineRepInd: ${theLine}`);
                            }

                            //now we reinsert all nametags by refinding the ] characters
                            nameInd = theLine.indexOf("]");

                            while (nameInd !== -1) {
                                //console.log(`check1: ${theLine}`);
                                //console.log(`check2:${theLine.substring(0, nameInd)}:`);
                                //console.log(`check3:${theLine.substring(nameInd)}:`);

                                //use shift() for storage array since we are cycling directly
                                theLine = theLine.substring(0, nameInd) + storage.shift() + theLine.substring(nameInd);
                                nameInd = theLine.indexOf("]", nameInd + 8);
                                console.log(`lineFinalInd: ${theLine}`);
                            }
                            //check string size and trigger warning is true
                            //there's two bugs here, one the getStringSize function doesn't recognize [] characters so it has
                            //a problem with computing for that and two this size calculation doesn't account for the big shouting
                            //text dialog that only has half the total letter space normal dialogue has
                            //will try and fix in future
                            if (getStringSize(theLine) > TOTAL_SPACE) {
                                lengthWarnTrigger = true;
                            }
                            //put newly modified theLine variable back into the dialogs array containing the whole file txt
                            dialogs[diaIndex] = theLine;
                        }
                        //if triggers triggered list file as modified in finishing message and add warning if needed
                        if (findFoundTrigger) {
                            finishMessage += "Folder: " + name + "   File: " + subName;
                            if (lengthWarnTrigger) {
                                finishMessage += " Length Warning! A Line Exceeded Textbox limit here";
                            }
                            finishMessage += "\n";
                        }

                        //recombine dialogs array into one variable to write to file
                        contents = dialogs.reduce((base, line) => base  + '"' + line, "");
                        contents = contents.substring(1);
                        //technically a bit ineffecient bc we don't need to save file every time even when we don't modify anything
                        //but we only have a few hundred txt files and my computer took like 2 mins max to find and replace a word 
                        //in nearly every txt file so its fine for now and I'll fix later 
                        await writable.write(contents);
                        await writable.close();
                        
                        console.log(`File: ${name}`);
                    }   
                }
            }
        }
        //actually print finish message to web browser page
        test.textContent = finishMessage;
    }

    //a find function basically just replace all with the replacing functionality stripped out
    async function findAllWords() {
        const dirHandle = await window.showDirectoryPicker();

        if (findBox.value == "") {
            test.textContent = "The find box is empty, fill it in and try again";
            return;
        } else if (findBox.value.includes("[") || replaceBox.value.includes("[")){
            test.textContent = "Your request contains [ which is used in nametag codes thus making it invalid for searches";
            return;
        } else if (findBox.value.includes("]") || replaceBox.value.includes("]")){
            test.textContent = "Your request contains ] which is used in nametag codes thus making it invalid for searches";
            return;
        } else {
            test.textContent = "";
        }

        findKey = findBox.value;
        console.log(`findKey: ${findKey}`);
        
        test.textContent = "Loading....";
        finishMessage = "Done\nFiles with Keyword Found:\n";

        for await (const [name, handle] of dirHandle) {
            if (handle.kind === 'file' && name.slice(-3) == "txt") {
                const file = await handle.getFile();
                const contents = await file.text();
                console.log(`File: ${name}`);

            } else if (handle.kind === 'directory' && folderSelect.value.includes(name)) {
                console.log(`Subfolder: ${name}`);

                for await (const [subName, subHandle] of handle) {
                    if (subHandle.kind === 'file' && subName.slice(-3) == "txt") {
                        const file = await subHandle.getFile();
                        contents = await file.text();

                        dialogs = contents.split('"');
                        
                        findFoundTrigger = false;
                        lengthWarnTrigger = false;
                        for (let diaIndex = 1; diaIndex < dialogs.length; diaIndex += 2) {
                            theLine = dialogs[diaIndex];
                            
                            storage = [];
                            nameInd = theLine.indexOf("[");
                            while (nameInd !== -1) {
                                storage.push(theLine.substring(nameInd, nameInd + 7));
                                theLine = theLine.substring(0,nameInd) + theLine.substring(nameInd + 7);
                                nameInd = theLine.indexOf("[", nameInd + 1);
                                console.log(`lineNameInd: ${theLine}`);
                            }
 
                            findInd = null;
                            getKeyInd = (startInd) => findInd = theLine.indexOf(findKey, startInd);
                            //we have to use == true becasue all html/dom values are strings which is silly but what can ya do
                            if (capitalSelect.value == true) {
                                getKeyInd = (startInd) => findInd = theLine.toUpperCase().indexOf(findKey.toUpperCase(), startInd);
                            } 
                            getKeyInd(0);
                            
                            if (findInd !== -1) {
                                findFoundTrigger = true;
                            }

                            //now we reinsert all nametags by refinding the ] characters
                            nameInd = theLine.indexOf("]");

                            while (nameInd !== -1) {
                                theLine = theLine.substring(0, nameInd) + storage.shift() + theLine.substring(nameInd);
                                nameInd = theLine.indexOf("]", nameInd + 8);
                                //console.log(`lineFinalInd: ${theLine}`);
                            }
                            if (getStringSize(theLine) > TOTAL_SPACE) {
                                lengthWarnTrigger = true;
                            }
                        }
                        if (findFoundTrigger) {
                            finishMessage += "Folder: " + name + "   File: " + subName;
                            if (lengthWarnTrigger) {
                                finishMessage += " Length Warning! A Line Exceeded Textbox limit here";
                            }
                            finishMessage += "\n";
                        }
                        console.log(`File: ${subName}`);
                    }   
                }
            }
        }
        test.textContent = finishMessage;
    }

    //actually updating the browser with the buttons and textboxes and stuff
    dFrag.appendChild(parentDiv)
    document.getElementById('content').appendChild(dFrag);
}

function getThatJP(text) { 
    let storedLines = [];
    let currentLine = '';
    let currLineType = "";
    let lines = text.split('\n');
    for (let lineNum in lines) {
        let line = lines[lineNum];
        if (textCode(line) != "NONE") {
            currLineType = textCode(line);
            let parts = line.split('"');
            if (parts.length > 1) {
                line = parts[1];
            }
            if (currLineType.startsWith('menut') || currLineType.startsWith('choicet'))
            {
                if (currentLine != '')
                    storedLines.push(currentLine);
                currentLine = '';
                storedLines.push(line + "\n");
            }
            else {
                currentLine += line + '\n';
            }
        }
        else if (clearCode(line)) {
            if (currLineType != "NONE") {
                currentLine += '\n';
            }
        }
        else {
            if (currentLine != '')
                storedLines.push(currentLine);
            currentLine = '';
            currLineType = "NONE";
        }
    }
    return storedLines;
}

/**
 * Checks if a line has a clear code.
 * @param {string} line 
 * @returns boolean
 */
function clearCode(line) {
    // Typically used for normal dialog
    if (line.startsWith('code0309') ||
        // Big text dialog
        line.startsWith('code030a') ||
        // Clears special dialog
        line.startsWith('code030c')
        ) return true;
    return false;
}

/**
 * Checks if a line has a text code.
 * @param {string} line 
 * @returns boolean
 */
function textCode(line) {
    /*
    if (
        line.startsWith('dialog') || 
        line.startsWith('place') || 
        line.startsWith('setname') || 
        line.startsWith('menut') || 
        line.startsWith('choicet') || 
        line.startsWith('popuptxt')
        ) return true;
    return false;
    */
    let lineType = "NONE";
    dialogTypes.forEach(type => {
        if (line.startsWith(type)) lineType = type;
    });
    return lineType;
}

/**
 * Sets up event listeners for textareas.
 * Auto-resize, text alteration, and error checking.
 */
function setTextareaEvents() {
    // Initial resize of all textareas
    document.querySelectorAll("textarea").forEach(function(textarea) {
        textarea.style.height = textarea.scrollHeight + "px";
        textarea.style.overflowY = "hidden";
    });
    // Event listener for user input in textareas
    document.querySelectorAll(".contains-text").forEach(function(textarea) {
        textarea.addEventListener("input", function() {
            if (!DIRTY)
                DIRTY = true;
            handleInput(textarea);
        });
        handleInput(textarea);
    });
}

function handleInput(textarea) {    
    Object.keys(TAGS).forEach(element => {
        alterText(textarea, element, TAGS[element]);
    });
    Object.keys(BAD_TAGS).forEach(element => {
        alterText(textarea, element, BAD_TAGS[element]);
    });
    textarea.value = textarea.value.replaceAll('\\', '');
    textarea.textContent = textarea.value;
    resizeBoxes(textarea);
    textarea.style.height = "auto";
    textarea.style.height = textarea.scrollHeight + "px";
    errorCheck(textarea);
    textarea.textContent = textarea.value;
}

/**
 * Replaces text in a textarea based on user input.
 * @param {HTMLTextAreaElement} textarea 
 * @param {string} oldValue 
 * @param {string} newValue 
 */
function alterText(textarea, oldValue, newValue) {
    if (!textarea.value.includes(oldValue)) return;
    // Save cursor position
    let start = textarea.selectionStart;
    let end = textarea.selectionEnd;
    // New cursor position offset
    let lengthDiff = (newValue.length - oldValue.length);
    textarea.value = textarea.value.replaceAll(oldValue, newValue);
    // Restore cursor position
    textarea.selectionStart = start + lengthDiff;
    textarea.selectionEnd = end + lengthDiff;
}

/**
 * Error checker. Updates textarea on user input.
 * @param {HTMLTextAreaElement} textarea 
 */
function errorCheck(textarea) {
    let codeArea = textarea.parentElement.getElementsByClassName('code-area')[0];
    let charArea = textarea.parentElement.getElementsByClassName('charcount-textarea')[0];
    let dialogLines = textarea.value.split('\n');
    let codeLines = codeArea.value.split('\n');
    let hasError = false;
    // Track consecutive dialogue lines without clear code
    let dialogueCount = 0;
    // Straight up don't remember why I put this here. May remove later.
    if (dialogLines.length == 1 && dialogLines[0] == '') {
        hasError = false;
    }
    for (let i = 0; i < dialogLines.length; i++) {
        if (i > 0 && (
            textarea.classList.contains('placetxt') || 
            textarea.classList.contains('menut') || 
            textarea.classList.contains('choicet') || 
            textarea.classList.contains('popup'))) {

            hasError = true;
            break;
        }

        let line = dialogLines[i];
        // Based on actual amount of characters, instead of string size in bytes
        let length = getStringSize(line);
        // Should probably add something for big text as well. I don't know the limit though.
        if (textarea.classList.contains('dialogtxt') && length > TOTAL_SPACE) {
            hasError = true;
            break;
        }
        else if (textarea.classList.contains('dialogbig') && length*2 > TOTAL_SPACE) {
            hasError = true;
            break;
        }
        // Dialogue in a line with a clear code
        if (clearCode(codeLines[i]) && length > 0) {
            hasError = true;
            break;
        }
    }
    // Check for more than 3 consecutive dialogue lines without clear code
    for (let j = 0; j < codeLines.length; j++) {
        let line2 = codeLines[j];
        if (clearCode(line2)) {
            dialogueCount = 0;
        }
        else {
            dialogueCount += 1;
            if (dialogueCount > 1 && textarea.classList.contains('dialogbig')) {
                hasError = true;
                break;
            }
            else if (dialogueCount > 3) {
                hasError = true;
                break;
            }
        }
    }
    if (hasError) {
        if (charArea.classList.contains('no-error'))
            charArea.classList.remove('no-error');
        if (!charArea.classList.contains('error'))
            charArea.classList.add('error');
    }
    else {
        if (charArea.classList.contains('error'))
            charArea.classList.remove('error');
        if (!charArea.classList.contains('no-error'))
            charArea.classList.add('no-error');
    }
}

/**
 * Function for equally resizing both textareas in a code/dialogue pair.
 * @param {HTMLTextAreaElement} textarea 
 */
function resizeBoxes(textarea) {
    let codeArea = textarea.parentElement.getElementsByClassName('code-area')[0];
    let charCountArea = textarea.parentElement.getElementsByClassName('charcount-textarea')[0];
    let dialogLines = textarea.value.split('\n');
    let codeLines = codeArea.value.split('\n');
    // PROBLEM
    let dialogueType = codeLines[0]
    let clearType = '';
    let newCodeLines = [];
    let newCharCountLines = [];
    // Find clear code
    for (let i = 0; i < codeLines.length; i++) {
        let line = codeLines[i];
        if (clearCode(line)) {
            clearType = line;
            break;
        }
    }
    if (clearType == '') clearType = 'code0309\t';
    // Rewride code area based on dialogue area
    for (let j = 0; j < dialogLines.length; j++) {
        let line = dialogLines[j];
        if (j == 0) {
            newCodeLines.push(codeLines[0]);
            let length = getStringSize(line);
            if (textarea.classList.contains('dialogbig')) 
                newCharCountLines.push(TOTAL_SPACE - length*2);
            else
                newCharCountLines.push(TOTAL_SPACE - length);
        }
        else if (line.length == 0) {
            newCodeLines.push(clearType);
            newCharCountLines.push(0);
        }
        else {
            newCodeLines.push(dialogueType);
            let length = getStringSize(line);
            if (textarea.classList.contains('dialogbig')) 
                newCharCountLines.push(TOTAL_SPACE - length*2);
            else
                newCharCountLines.push(TOTAL_SPACE - length);
        }
    }
    codeArea.value = newCodeLines.join('\n');
    charCountArea.value = newCharCountLines.join('\n');
    // Sync code area text content
    codeArea.textContent = codeArea.value;
    charCountArea.textContent = charCountArea.value;
    // Resize code area
    codeArea.style.height = "auto";
    charCountArea.style.height = "auto";
}


/**
 * Process each line of code, cause it affects speaker information + other stuff.
 * @param {string[]} lines 
 * @param {string} line 
 */
function processCode(lines, line) {
    let editedLine = '';
    let parts = [];
    let label = '';
    let start = 0;
    let end = 0;
    // IScript is calling a function, so I need to process that function's code too
    if (line.startsWith('call')) {
        editedLine = line.replace("call", "").trim().replace(' ', '');
        label = editedLine + ':';
        start = getLineNumber(lines, label, 0);
        end = getLineNumber(lines, 'ret', start);
        for (let i = start; i < end; i++) {
            processCode(lines, lines[i]);
        }
    }
    // Sets left and right speaker names.
    else if (line.startsWith('code047d')) {
        editedLine = line.replace("code047d", "").trim().replace(' ', '');
        parts = editedLine.split(",");
        if (parts[0] == "0")
            speakerLeft = names[parts[1]];
        else if (parts[0] == "1")
            speakerRight = names[parts[1]];
    }
    // Sets active speaker.
    else if (line.startsWith('code047e')) {
        editedLine = line.replace("code047e", "").trim().replace(' ', '');
        parts = editedLine.split(",");
        if (parts[0] == "0")
            speakerLeftOn = (parts[1] == "1");
        else if (parts[0] == "1")
            speakerRightOn = (parts[1] == "1");
    }
    // Indicates dialogue for male player
    else if (line.startsWith('jumpz')) {
        if (line.includes('$b003 ==')) {
            saveSpeaker();
        }
        if (line.includes('$b002 == 0')) {
            editedLine = line.replace("jumpz", "").trim().replace(' ', '');
            parts = editedLine.split(",");
            // When to swap to female dialogue
            genderTrigger = parts[0];
            gender = "MALE";
        }
        else if (line.includes('$b003 == 0')) {
            editedLine = line.replace("jumpz", "").trim().replace(' ', '');
            parts = editedLine.split(",");
            partnerTrigger = parts[0];
            partner = 0;
            //partner_changed = true;
        }
        else if (line.includes('$b003 == 1')) {
            editedLine = line.replace("jumpz", "").trim().replace(' ', '');
            parts = editedLine.split(",");
            partnerTrigger = parts[0];
            partner = 1;
            //partner_changed = true;
        }
        else if (line.includes('$b003 == 2')) {
            editedLine = line.replace("jumpz", "").trim().replace(' ', '');
            parts = editedLine.split(",");
            partnerTrigger = parts[0];
            partner = 2;
            //partner_changed = true;
        }
        else if (line.includes('$b003 == 3')) {
            editedLine = line.replace("jumpz", "").trim().replace(' ', '');
            parts = editedLine.split(",");
            partnerTrigger = parts[0];
            partner = 3;
            //partner_changed = true;
        }
    }
    // Because gender trigger uses jumps, this should catch when to end gendered dialogue
    else if (line.startsWith('goto')) {
        editedLine = line.replace("goto", "").trim().replace(' ', '');
        if (gender == MALE)
            endGenderTrigger = editedLine;
        if (partner != -1) {
            endPartnerTrigger = editedLine;
            switch(partner) {
                case 0:
                    rundorEnd = editedLine;
                    break;
                case 1:
                    enziEnd = editedLine;
                    break;
                case 2:
                    killfithEnd = editedLine;
                    break;
                case 3:
                    rufeelEnd = editedLine;
                    break;
            }
        }
    }
    else if (line.startsWith('menutitle')) {

    }
    else if (line.startsWith('menutxt')) {
    }
    if (line.startsWith(genderTrigger)) {
        gender = FEMALE;
        genderTrigger = "NONE";
    }
    if (line.startsWith(endGenderTrigger) && gender == FEMALE) {
        gender = BOTH;
        endGenderTrigger = "NONE";
    }
    if (line.startsWith(partnerTrigger)) {
        partner += 1;
        partnerTrigger = "NONE";
        restoreSpeaker();
    }
    if (line.startsWith(endPartnerTrigger) && partnerTrigger == "NONE") {
        if (rundorEnd == endPartnerTrigger) {
            rundorEnd = "NONE";
        }
        if (enziEnd == endPartnerTrigger) {
            enziEnd = "NONE";
        }
        if (killfithEnd == endPartnerTrigger) {
            killfithEnd = "NONE";
        }
        if (rufeelEnd == endPartnerTrigger) {
            rufeelEnd = "NONE";
        }
    }
    // Code that actually closes the textbox. May use for something.
    if (line.startsWith('code0302')) {
    }

    if (partner != -1 && partnerTrigger == "NONE" && rundorEnd == "NONE" && enziEnd == "NONE" && killfithEnd == "NONE" && rufeelEnd == "NONE") {
        partner = -1;
    }
}

// #region Speaker Info Saving
let previousSpeakerLeft = "";
let previousSpeakerRight = "";
let previousSpeakerLeftOn = false;
let previousSpeakerRightOn = false;
let speakerSaved = false;
function saveSpeaker() {
    previousSpeakerLeft = speakerLeft;
    previousSpeakerRight = speakerRight;
    previousSpeakerLeftOn = speakerLeftOn;
    previousSpeakerRightOn = speakerRightOn;
    speakerSaved = true;
}
function restoreSpeaker() {
    if (!speakerSaved) return;
    speakerLeft = previousSpeakerLeft;
    speakerRight = previousSpeakerRight;
    speakerLeftOn = previousSpeakerLeftOn;
    speakerRightOn = previousSpeakerRightOn;
}
function resetPreviousSpeaker() {
    previousSpeakerLeft = "";
    previousSpeakerRight = "";
    previousSpeakerLeftOn = false;
    previousSpeakerRightOn = false;
    speakerSaved = false;
}
// #endregion

/**
 * Get index of string in an array. Because for some reason Array.ofIndex() doesn't work.
 * @param {string[]} lines 
 * @param {string} label 
 * @param {int} startLine 
 * @returns 
 */
function getLineNumber(lines, label, startLine) {
    for (let i = startLine; i < lines.length; i++) {
        if (lines[i].startsWith(label)) {
            return i;
        }
    }
    return -1;
}

function getStringSize(str) {
    let size = 0;
    let copy = str;
    Object.keys(TAGS).forEach(element => {
        if (element == "..." || element == "   " || element == "—") return;
        if (!copy.includes(TAGS[element])) return;
        let count = (copy.split(TAGS[element]).length - 1);
        size += count * TAG_LENGTH[element];
        copy = copy.replaceAll(TAGS[element], "");
    });
    let i = copy.length;
    while (i--) {
        let code = copy.charAt(i);
        if (code in CHARACTER_SPACE) {
            size += CHARACTER_SPACE[code];
        }
        else {
            console.log("Unknown character: " + code);
            size += 12;
        }
    }
    return size;
}

function showAbout() {
    alert("IScript Dialogue Editor\n\nOpen: Load IScript off your local files\n\nToggle JP: Toggle JP text visibility.\n\nToggle Code: Toggle code visibility.\n\nSave: Save edited IScript to wherever your downloads go. (I can't change this)\n\n\nHas a built in error checker. Green=Good, Red=Errors\nMost dialogue lines have a limit of 226 pixels This checks how many you have remaining.\nLines with the big font take double the pixel space.\n\nAuto-text replacer\nTriple space inserts a IDSP(the weird Japanese space)\nTriple period becomes ellipses\n\nCharacter Counter: Shows how many pixels would be left in the text box. Tags like #PlayerName count as 72, since they have a mx size of 12 characters, and most characters are 6 pixels wide.\n\nRead the readme for more information.");
}

function showSpecialCharacters() {
    alert("Special Characters:\n\nPlayer Name = #PlayerName\nPlayer Nickname = #PlayerNickname\nPartner Name = #PartnerName\nItem Name: #ItemName\nEllipses = …\nEmdash = --\nIDSP = 　\nHeart symbol = #Heart\nPaw = #Paw\n● = #Dot");
}




// Warn user about unsaved changes when leaving page
window.onbeforeunload = function() {
    if (DIRTY || unsavedJson) {
        return "Data will be lost if you leave the page, are you sure?";
    }
}

function loadTab(e, name) {
    if (name === 'Iscript'){
        if (unsavedJson) {
            if (!confirm("Do you want to change tab? You have unsaved changes that will be lost.")) {
                return;
            }
        }
    } else {
        if (DIRTY) {
            if (!confirm("Do you want to change tab? You have unsaved changes that will be lost.")) {
                return;
            }
        }
    }
    var i, content, tablink;
    content = document.getElementsByClassName('tabcontent');
    for (i = 0; i < content.length; i++) {
        content[i].style.display = 'none';
    }
    tablink = document.getElementsByClassName('tablink');
    for (i = 0; i < tablink.length; i++) {
        tablink[i].className = tablink[i].className.replace(' active', '');
    }
    document.getElementById(name).style.display = 'block';
    e.currentTarget.className += ' active';
    var script = document.getElementById('content');
    var other = document.getElementById('json-content');
    script.innerHTML = '';
    other.innerHTML = '';
    if (name === 'Iscript') {
        script.style.display = 'block';
        other.style.display = 'none';    
    } else {
        script.style.display = 'none';
        other.style.display = 'block';    
    }
}

function getStringWidth(str) {
    var size = 0;
    for (const c of str){
        if (c in CHARACTER_SPACE){
            size += CHARACTER_SPACE[c];
        } else {
            if (c.charCodeAt(0) < 32){
                size += c.charCodeAt(0);
            } else {
                size +=12;   
            }
        }
    }
    return size;
}


function getStringLength(str) {
    var len = 0;
    for (const c of str){
        if (c.charCodeAt(0) < 128){
            len += 1;
        } else {
            len += 2;   
        }
    }
    return len;
}

function validateTranslation(e){
    const value = e.target.value;
    const input = e.target;
    const div = e.target.parentNode;
    const widthDiv = div.children[1];
    const lengthDiv = div.children[2];
    var width = getStringWidth(JSON.parse('"' + value.replaceAll('"', '\\"') + '"'));
    var length = getStringLength(JSON.parse('"' + value.replaceAll('"', '\\"') + '"'));
    const maxLength = parseInt(div.getAttribute('max-length'), 10);
    const data = JSON.parse(div.getAttribute('data'));
    widthDiv.textContent = 'width=' + width;
    lengthDiv.textContent = 'len=' + length;
    let err = -1;
    let cnt = 0;
    for (var i in value){
        if (value.charCodeAt(i) > 0xff){
            cnt += 2;
            if (cnt % 2 != 0 && value.charCodeAt(i) == 0x3000){
                err = i;
                break;
            }
        } else {
            cnt += 1;
        }
    }
    let bg_change = false;
    if (!value){
        input.style.backgroundColor = '#c0ca33';
        widthDiv.textContent = 'EMPTY: width=' + width;
    } else {
        input.style.backgroundColor = '#ffffff';
    }
    if (width > 120 || length > maxLength || err != -1){
        if (length > maxLength){
            div.style.backgroundColor = '#f7dc6f';
            bg_change = true;
            if (data['type'] !== 'StructArray'){
                lengthDiv.textContent = 'len=' + length + ' (WARN)';
            }
            else {
                lengthDiv.textContent = 'len=' + length + ' (ERROR)';
            }
        }
        if (data['type'] === 'StructArray' && value.indexOf('\u3000') > 0){
            var parts = value.split('\u3000');
            for (var tmp of parts) {
                let tmp_w = getStringWidth(JSON.parse('"' + tmp.replaceAll('"', '\\"') + '"'));
                if (tmp_w > 120) {
                    div.style.backgroundColor = '#f19460';
                    bg_change = true;
                    widthDiv.textContent = 'width=' + width + ' (ERROR B)';
                    break;
                }
            }
        } else if (width > 224) {
            div.style.backgroundColor = '#f1948a';
            bg_change = true;
            widthDiv.textContent = 'width=' + width + ' (ERROR)';
        }
        if (err != -1) {
            if (!bg_change) {
                div.style.backgroundColor = '#8a4a8a';}
            widthDiv.textContent = widthDiv.textContent + ' (Index Error: ' + err.toString() + ')'
        }
    } else {
        div.style.backgroundColor = '#ffffff';
        var key = data['key'];
        if (data['type'] === 'SJIS string'){
            jsonData[key]['translation'] = value;
        } else if (data['type'] === 'SJIS table'){
            var index = parseInt(data['index'], 10);
            jsonData[key]['data'][index]['translation'] = value;
        }  
        unsavedJson = true;
    }   
}

function showHideStr(e){
    const div = e.target.parentNode.children[2];
    const btn = e.target.parentNode.children[1];
    if (div.style.display === "none") {
        div.style.display = "block";
        btn.textContent = 'Hide';
    } else {
        div.style.display = "none";
        btn.textContent = 'Show';
    }
}

function renderString(obj){
    const div = document.createElement('div');
    const metadata = {
        key: obj['address']['value'], 
        type: obj['type']};
    const metadataStr = JSON.stringify(metadata);
    div.className = 'SJIS';
    const p1 = document.createElement('p');
    p1.className = 'address';
    p1.textContent = 'String: ' + obj['address']['value'];
    div.appendChild(p1);
    const btn = document.createElement('button');
    btn.textContent = 'Hide';
    btn.addEventListener('click', showHideStr);
    div.appendChild(btn);
    const subDiv = document.createElement('div');
    const p2 = document.createElement('p');
    p2.className = 'raw';
    p2.textContent = obj['raw'];
    const span = document.createElement('span');
    span.className = 'str-length';
    span.textContent = 'len=' + obj['length'];
    p2.appendChild(span);
    subDiv.appendChild(p2);
    const p3 = document.createElement('p');
    p3.className = 'translation';
    const input = document.createElement('input');    
    input.className = 'input-translation';
    input.size = 60;
    input.setAttribute('value', obj['translation']);
    input.setAttribute('type', 'text');
    input.addEventListener('change', validateTranslation);
    p3.appendChild(input);
    const span1 = document.createElement('span');
    span1.className = 'str-width';
    span1.textContent = 'width=' + getStringWidth(JSON.parse('"' + obj['translation'].replaceAll('"', '\\"') + '"'));
    const span2 = document.createElement('span');
    span2.className = 'str-length';
    span2.textContent = 'len=' + getStringLength(JSON.parse('"' + obj['translation'].replaceAll('"', '\\"') + '"'));
    p3.appendChild(span1);
    p3.appendChild(span2);
    p3.setAttribute('max-length', obj['length']);
    p3.setAttribute('data', metadataStr);
    subDiv.appendChild(p3);
    div.appendChild(subDiv);
    document.getElementById('page-content').appendChild(div);
    const ev = new Event('change', { bubbles: false });
    input.dispatchEvent(ev);
}

function renderTable(obj){
    const div = document.createElement('div');
    div.className = 'SJIS';
    const p = document.createElement('p');
    p.className = 'address';
    p.textContent = 'Table: ' + obj['address']['value'];
    div.appendChild(p);
    const btn = document.createElement('button');
    btn.textContent = 'Hide';
    btn.addEventListener('click', showHideStr);
    div.appendChild(btn);
    const tDiv = document.createElement('div');
    for (const idx in obj['data']){
        var sjis = obj['data'][idx];
        if (sjis['length'] == 0){
            continue;
        }
        var metadata = {
            key: obj['address']['value'], 
            index: idx,
            type: obj['type']};
        var metadataStr = JSON.stringify(metadata);
        var subDiv = document.createElement('div');
        var p1 = document.createElement('p');
        p1.className = 'raw';
        p1.textContent = sjis['raw'];
        var span = document.createElement('span');
        span.className = 'str-length';
        span.textContent = 'len=' + sjis['length'];
        p1.appendChild(span);
        subDiv.appendChild(p1);
        var p2 = document.createElement('p');
        p2.className = 'translation';
        var input = document.createElement('input'); 
        input.className = 'input-translation';        
        input.size = 80;
        input.setAttribute('value', sjis['translation']);
        input.setAttribute('type', 'text');
        input.addEventListener('change', validateTranslation);
        p2.appendChild(input);
        var span1 = document.createElement('span');
        span1.className = 'str-width';
        span1.textContent = 'width=' + getStringWidth(JSON.parse('"' + sjis['translation'].replaceAll('"', '\\"') + '"'));
        var span2 = document.createElement('span');
        span2.className = 'str-length';
        span2.textContent = 'len=' + getStringLength(JSON.parse('"' + sjis['translation'].replaceAll('"', '\\"') + '"'));
        p2.appendChild(span1);
        p2.appendChild(span2);
        p2.setAttribute('max-length', sjis['length']);
        p2.setAttribute('data', metadataStr);
        subDiv.appendChild(p2);
        tDiv.appendChild(subDiv);
        var ev = new Event('change', { bubbles: false });
        input.dispatchEvent(ev);
    }
    div.appendChild(tDiv);
    document.getElementById('page-content').appendChild(div);
}

function renderStrucArr(obj){
    const div = document.createElement('div');
    div.className = 'SJIS';
    const p = document.createElement('p');
    p.className = 'address';
    p.textContent = 'StructArray: ' + obj['address']['value'];
    div.appendChild(p);
    const btn = document.createElement('button');
    btn.textContent = 'Hide';
    btn.addEventListener('click', showHideStr);
    div.appendChild(btn);
    const tDiv = document.createElement('div');
    tDiv.className = 'struct-arr';
    for (const idx in obj['data']){
        var struc = obj['data'][idx];
        if (struc['data'].length == 0){
            continue;
        }
        var sDiv = document.createElement('div');
        sDiv.className = 'struct';
        var sp = document.createElement('p');
        sp.textContent = 'Index = ' + idx;
        sp.className = 'struct-idx';
        sDiv.appendChild(sp);
        for (const midx in struc['data']){
            let metadata = {
                key: obj['address']['value'], 
                struct_idx: idx,
                member_idx: midx,
                type: obj['type']};
            let metadataStr = JSON.stringify(metadata);
            let sjis = struc['data'][midx]['data'];
            let subDiv = document.createElement('div');
            let p1 = document.createElement('p');
            p1.className = 'raw';
            p1.textContent = sjis['raw'];
            let span = document.createElement('span');
            span.className = 'str-length';
            span.textContent = 'len=' + sjis['length'];
            p1.appendChild(span);
            subDiv.appendChild(p1);
            var p2 = document.createElement('p');
            p2.className = 'translation';
            var input = document.createElement('input');
            input.className = 'input-translation';            
            input.size = 80;
            input.setAttribute('value', sjis['translation']);
            input.setAttribute('type', 'text');
            input.addEventListener('change', validateTranslation);
            p2.appendChild(input);
            var span1 = document.createElement('span');
            span1.className = 'str-width';
            span1.textContent = 'width=' + getStringWidth(JSON.parse('"' + sjis['translation'].replaceAll('"', '\\"') + '"'));
            var span2 = document.createElement('span');
            span2.className = 'str-length';
            span2.textContent = 'len=' + getStringLength(JSON.parse('"' + sjis['translation'].replaceAll('"', '\\"') + '"'));
            p2.appendChild(span1);
            p2.appendChild(span2);
            p2.setAttribute('max-length', sjis['length']);
            p2.setAttribute('data', metadataStr);
            subDiv.appendChild(p2);
            sDiv.appendChild(subDiv);
            var ev = new Event('change', { bubbles: false });
            input.dispatchEvent(ev);     
        }
        tDiv.appendChild(sDiv);
    }
    div.appendChild(tDiv);
    document.getElementById('page-content').appendChild(div);
}

var PAGES = Array()
var CURRENT_PAGE = 0;
var PAGE_MAX = 0;

function pagingData(data){
    var current = 0;
    var page = Array()
    for (const key in data) {
        let obj = data[key];
        page.push(key)
        if (Object.hasOwn(obj, 'type')){
            if (obj['type'] === 'SJIS string'){
                current += 1;
            } else if (obj['type'] === 'SJIS table'){
                current += obj['data'].length;
            } else if (obj['type'] === 'StructArray'){
                current += obj['data'].length * 2;
            }
        }
        if (current > 60) {
            PAGES.push(page);
            page = Array();
            current = 0;
        }
    }
    if (current > 0) {
        PAGES.push(page)
    }
    PAGE_MAX = PAGES.length;
}

function nextPage(){
    if (CURRENT_PAGE + 1 < PAGE_MAX) {
        CURRENT_PAGE += 1;
        displayPage(CURRENT_PAGE)
    }
}

function prevPage(){
    if (CURRENT_PAGE - 1 >= 0) {
        CURRENT_PAGE -= 1;
        displayPage(CURRENT_PAGE)
    }
}


function setPage(e){
    const value = parseInt(e.target.value) - 1;
    if (value < PAGE_MAX && value >= 0) {
        CURRENT_PAGE = value;
        displayPage(CURRENT_PAGE)
    }
}

function displayPage(index) {
    const divs = document.querySelectorAll('.translation')
    for (const div of divs) {
        let value = div.children[0].value
        let data = JSON.parse(div.getAttribute('data'));
        let key = data['key'];
        if (data['type'] === 'SJIS string'){
            jsonData[key]['translation'] = value;
        } else if (data['type'] === 'SJIS table'){
            let idx = parseInt(data['index'], 10);
            jsonData[key]['data'][idx]['translation'] = value;
        } else if (data['type'] === 'StructArray'){
            let idx = parseInt(data['struct_idx'], 10);
            let midx = parseInt(data['member_idx'], 10);
            jsonData[key]['data'][idx]['data'][midx]['data']['translation'] = value;
        }
    }
    const container = document.getElementById('json-content');
    container.innerHTML = '';
    const prev = document.createElement('button');
    prev.textContent = 'Prev';
    prev.className = 'page-btn';
    prev.addEventListener('click', prevPage);
    const span = document.createElement('span');
    span.textContent = 'Page';
    span.className = 'page-number';
    const input = document.createElement('input')
    input.className = 'page-input';
    input.type = 'text';
    input.value = index + 1;
    input.addEventListener('change', setPage);
    const span1 = document.createElement('span');
    span1.textContent = '/' + PAGE_MAX.toString();
    span1.className = 'page-number';
    const next = document.createElement('button');
    next.textContent = 'Next';
    next.className = 'page-btn';
    next.addEventListener('click', nextPage);
    const div = document.createElement('div');
    div.id = 'page-control';
    div.className = 'page-control';
    div.appendChild(prev);
    div.appendChild(span);
    div.appendChild(input);
    div.appendChild(span1);
    div.appendChild(next);
    const div2 = document.createElement('div');
    div2.id = 'page-content';
    div2.className = 'page-content';
    container.appendChild(div)
    container.appendChild(div2)
    let keys = PAGES[index];
    for (const key of keys) {
        let obj = jsonData[key];
        if (Object.hasOwn(obj, 'type')){
            if (obj['type'] === 'SJIS string'){
                renderString(obj);
            } else if (obj['type'] === 'SJIS table'){
                renderTable(obj);
            } else if (obj['type'] === 'StructArray'){
                renderStrucArr(obj);
            }
        }
    }
}


function readJsonFile() {
    const inFile = document.getElementById('open-json-input');
    inFile.click();
    inFile.onchange = e => {
        const f = e.target.files[0];
        if (!f) return;
        const reader = new FileReader();
        reader.onload = function(e){
            jsonText = e.target.result;
            document.getElementById('json-content').innerHTML = '';
            jsonData = JSON.parse(jsonText.replaceAll('\\u', '\\\\u'));
            PAGES = Array();
            PAGE_MAX = 0;
            CURRENT_PAGE = 0;
            pagingData(jsonData);
            displayPage(0);
        }
        reader.readAsText(f,'UTF-8');
    }
}

function saveJsonFile(){
    const divs = document.querySelectorAll('.translation')
    for (const div of divs) {
        var value = div.children[0].value
        var data = JSON.parse(div.getAttribute('data'));
        var key = data['key'];
        if (data['type'] === 'SJIS string'){
            jsonData[key]['translation'] = value;
        } else if (data['type'] === 'SJIS table'){
            var index = parseInt(data['index'], 10);
            jsonData[key]['data'][index]['translation'] = value;
        } else if (data['type'] === 'StructArray'){
            let idx = parseInt(data['struct_idx'], 10);
            let midx = parseInt(data['member_idx'], 10);
            jsonData[key]['data'][idx]['data'][midx]['data']['translation'] = value;
        }
    }
    const a = document.createElement('a');
    jsonText = JSON.stringify(jsonData, null, 4).replaceAll('\\\\u', '\\u') + '\n';
    const blob = new Blob([jsonText], {type: 'text/plain;charset=utf-8'});
    const url = URL.createObjectURL(blob);
    a.href = url;
    a.download = 'data.json';
    document.body.appendChild(a);
    a.click();
    unsavedJson = false;
    setTimeout( () => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        }, 5000);
}


mainSetup();
