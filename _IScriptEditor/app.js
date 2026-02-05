
const filenameHeader = document.getElementById('filename-display');
// Reference to buttons
const openBtn = document.getElementById('open-button');
const saveBtn = document.getElementById('save-button');
const toggleJpBtn = document.getElementById('toggle-jp-button');
const toggleCodeBtn = document.getElementById('toggle-code-button');
const specialCharactersBtn = document.getElementById('special-characters-button');
const aboutBtn = document.getElementById('about-button');
const day_selector = document.getElementById('day-selector');
const chapter_selector = document.getElementById('chapter-selector');
const loadBtn = document.getElementById('load-button');
// Event listeners for buttons
openBtn.addEventListener('click', readFile);
saveBtn.addEventListener('click', saveFile);
toggleJpBtn.addEventListener('click', toggleJp);
toggleCodeBtn.addEventListener('click', toggleCode);
specialCharactersBtn.addEventListener('click', showSpecialCharacters);
aboutBtn.addEventListener('click', showAbout);
day_selector.addEventListener('change', loadDay);
loadBtn.addEventListener('click', loadChapter);

// Variables to hold file data
var enFilename = '';
var jpFilename = '';
var jpText = [];
var engCodeFile = '';
var hideCode = true;
var hideJp = true;

// Variables for tracking speaker
var speaker_left = "NONE";
var speaker_right = "NONE";
var speaker_left_on = false;
var speaker_right_on = false;
// Variables for tracking player gendered dialogue
const MALE = "MALE";
const FEMALE = "FEMALE";
const BOTH = "BOTH";
var gender_trigger = "NONE";
var end_gender_trigger = "NONE";
var gender = "BOTH";
// Variable for tracking partner dialogue
var partner_changed = false;
var partner_trigger = "NONE";
var end_partner_trigger = "NONE";
var p0_end = "NONE";
var p1_end = "NONE";
var p2_end = "NONE";
var p3_end = "NONE";
var partner = -1;

const TOTAL_SPACE = 216;

var DAYS_LOADED = false;
var CHAPTERS_LOADED = false;


var DIRTY = false;


async function mainSetup() {
    const octoModule = await import("https://esm.sh/octokit");
    const octokit = new octoModule.Octokit();
    let days = [];
    octokit.rest.repos.getContent({
        owner: 'CornStarch9272',
        repo: 'SNSC3-Translation',
        ref: 'IScript Development',
    }).then(response => {
        for (let item of response.data) {
            if (item.type === 'dir') {
                days.push(item.name);
            }
        }
        day_selector.innerHTML = '';
        for (let day of days) {
            if (day == 'script untranslated' || day == 'system_messages') continue;
            let option = document.createElement('option');
            option.value = day;
            option.innerHTML = day;
            day_selector.appendChild(option);
        }
        DAYS_LOADED = true;
        loadDay();
    });
}

/**
 * Read IScript file and process its contents
 */
function readFile()
{
    // Get file input element and trigger click
    const openFileInput = document.getElementById('open-file-input');
    openFileInput.click();
    // Handle file being selected / changed
    openFileInput.onchange = e => {
        const file_ = e.target.files[0];
        filename = file_.name;
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
        ref: 'IScript Development',
        path: day_selector.value,
    }).then(response => {
        for (let item of response.data) {
            if (item.type === 'file') {
                chapters.push(item.name);
            }
        }
        chapter_selector.innerHTML = '';
        for (let chapter of chapters) {
            let option = document.createElement('option');
            option.value = chapter;
            option.innerHTML = chapter;
            chapter_selector.appendChild(option);
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
        ref: 'IScript Development',
        path: day_selector.value + '/' + chapter_selector.value,
    }).then(async response => {
        enFilename = chapter_selector.value;
        const content = atob(response.data.content);
        engCodeFile = content;
        await readJPFile();
        filenameHeader.textContent = "Editing: " + enFilename;
    });
    DIRTY = false;
    checkProcessText();
}


async function readJPFile()
{
    const octoModule = await import("https://esm.sh/octokit");
    const octokit = new octoModule.Octokit();
    let splits = enFilename.split('_');
    let jpScriptPath = splits[splits.length - 1];
    await octokit.rest.repos.getContent({
        owner: 'CornStarch9272',
        repo: 'SNSC3-Translation',
        ref: 'IScript Development',
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
        if (element == "..." || element == "   ") return;
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
}

/**
 * Extract text from the relevant elements
 * @returns string
 */
function extractText() {
    let text = '';
    divCounter = 0;
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
            else if (textCode(prevLineType)) {
            //if (textCode(prevLineType)) {
                let speakerElement = document.createElement('p');
                // Display name of active speaker(s)
                if (speaker_left_on && speaker_right_on) {
                    speakerElement.textContent = "BOTH: " + speaker_left + " / " + speaker_right;
                }
                else if (speaker_left_on) {
                    speakerElement.textContent = speaker_left;
                }
                else if (speaker_right_on) {
                    speakerElement.textContent = speaker_right;
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

                let codeLines  = [];
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
                for (x in storedLines) {
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
                if (prevLineType == 'dialogtxt') {
                    dialogArea.classList.add('dialogue');
                    charCountArea.classList.add('dialogue');
                }
                else if (prevLineType == 'dialogbig') {
                    dialogArea.classList.add('bigtext');
                    charCountArea.classList.add('bigtext');
                }
                else if (prevLineType == 'placetxt') {
                    dialogArea.classList.add('locationtext');
                    charCountArea.classList.add('locationtext');
                }
                // Will add more later, but this for now
                else {
                    dialogArea.classList.add('dialogue');
                    charCountArea.classList.add('dialogue');
                }
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

function getThatJP(text) { 
    let storedLines = [];
    let currentLine = '';
    let currLineType = "";
    let lines = text.split('\n');
    for (let lineNum in lines) {
        let line = lines[lineNum];
        if (textCode(line)) {
            let parts = line.split('"');
            if (parts.length > 1) {
                line = parts[1];
            }
            currentLine += line + '\n';
            currLineType = 'text';
        }
        else if (clearCode(line)) {
            if (currLineType == 'text') {
                currentLine += '\n';
            }
        }
        else {
            if (currentLine != '')
                storedLines.push(currentLine);
            currentLine = '';
            currLineType = 'code';
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
    if (line.startsWith('code0309')) 
        return true;
    // Big text dialog
    else if (line.startsWith('code030a')) 
        return true;
    // Clears special dialog
    else if (line.startsWith('code030c')) 
        return true;
    return false;
}

/**
 * Checks if a line has a text code.
 * @param {string} line 
 * @returns boolean
 */
function textCode(line) {
    if (line.startsWith('dialog')) 
        return true;
    else if (line.startsWith('place')) 
        return true;
    else if (line.startsWith('setname')) 
        return true;
    else if (line.startsWith('menut')) 
        return true;
    else if (line.startsWith('choicet')) 
        return true;
    else if (line.startsWith('popuptxt')) 
        return true;
    return false;
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
            textarea.classList.contains('locationtext') || 
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
        if (textarea.classList.contains('dialogue') && length > TOTAL_SPACE) {
            hasError = true;
            break;
        }
        else if (textarea.classList.contains('bigtext') && length*2 > TOTAL_SPACE) {
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
            if (dialogueCount > 1 && textarea.classList.contains('bigtext')) {
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
    let dialogueType = codeLines[0];
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
        //if (line.trim() == '') {
        if (line.length == 0) {
            newCodeLines.push(clearType);
            newCharCountLines.push(0);
        }
        else {
            newCodeLines.push(dialogueType);
            let length = getStringSize(line);
            if (textarea.classList.contains('bigtext')) 
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
            speaker_left = names[parts[1]];
        else if (parts[0] == "1")
            speaker_right = names[parts[1]];
    }
    // Sets active speaker.
    else if (line.startsWith('code047e')) {
        editedLine = line.replace("code047e", "").trim().replace(' ', '');
        parts = editedLine.split(",");
        if (parts[0] == "0")
            speaker_left_on = (parts[1] == "1");
        else if (parts[0] == "1")
            speaker_right_on = (parts[1] == "1");
    }
    // Indicates dialogue for male player
    else if (line.startsWith('jumpz')) {
        if (line.includes('$b002 == 0')) {
            editedLine = line.replace("jumpz", "").trim().replace(' ', '');
            parts = editedLine.split(",");
            // When to swap to female dialogue
            gender_trigger = parts[0];
            gender = "MALE";
        }
        else if (line.includes('$b003 == 0')) {
            editedLine = line.replace("jumpz", "").trim().replace(' ', '');
            parts = editedLine.split(",");
            partner_trigger = parts[0];
            partner = 0;
            //partner_changed = true;
        }
        else if (line.includes('$b003 == 1')) {
            editedLine = line.replace("jumpz", "").trim().replace(' ', '');
            parts = editedLine.split(",");
            partner_trigger = parts[0];
            partner = 1;
            //partner_changed = true;
        }
        else if (line.includes('$b003 == 2')) {
            editedLine = line.replace("jumpz", "").trim().replace(' ', '');
            parts = editedLine.split(",");
            partner_trigger = parts[0];
            partner = 2;
            //partner_changed = true;
        }
        else if (line.includes('$b003 == 3')) {
            editedLine = line.replace("jumpz", "").trim().replace(' ', '');
            parts = editedLine.split(",");
            partner_trigger = parts[0];
            partner = 3;
            //partner_changed = true;
        }
    }
    // Because gender trigger uses jumps, this should catch when to end gendered dialogue
    else if (line.startsWith('goto')) {
        editedLine = line.replace("goto", "").trim().replace(' ', '');
        if (gender == MALE)
            end_gender_trigger = editedLine;
        if (partner != -1) {
            end_partner_trigger = editedLine;
            switch(partner) {
                case 0:
                    p0_end = editedLine;
                    break;
                case 1:
                    p1_end = editedLine;
                    break;
                case 2:
                    p2_end = editedLine;
                    break;
                case 3:
                    p3_end = editedLine;
                    break;
            }
        }
    }
    else if (line.startsWith('menutitle')) {

    }
    else if (line.startsWith('menutxt')) {
    }
    if (line.startsWith(gender_trigger)) {
        gender = FEMALE;
        gender_trigger = "NONE";
    }
    if (line.startsWith(end_gender_trigger) && gender == FEMALE) {
        gender = BOTH;
        end_gender_trigger = "NONE";
    }
    if (line.startsWith(partner_trigger)) {
        partner += 1;
        partner_trigger = "NONE";
    }
    if (line.startsWith(end_partner_trigger) && partner_trigger == "NONE") {
        if (p0_end == end_partner_trigger) {
            p0_end = "NONE";
        }
        if (p1_end == end_partner_trigger) {
            p1_end = "NONE";
        }
        if (p2_end == end_partner_trigger) {
            p2_end = "NONE";
        }
        if (p3_end == end_partner_trigger) {
            p3_end = "NONE";
        }
    }
    // Code that actually closes the textbox. May use for something.
    if (line.startsWith('code0302')) {
    }

    if (partner_trigger == "NONE" && p0_end == "NONE" && p1_end == "NONE" && p2_end == "NONE" && p3_end == "NONE") {
        partner = -1;
    }
}

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
        if (element == "..." || element == "   ") return;
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
            size += 8;
        }
    }
    return size;
}

function showAbout() {
    alert("IScript Dialogue Editor\n\nOpen: Load IScript off your local files\n\nToggle JP: Toggle JP text visibility.\n\nToggle Code: Toggle code visibility.\n\nSave: Save edited IScript to wherever your downloads go. (I can't change this)\n\n\nHas a built in error checker. Green=Good, Red=Errors\nMost dialogue lines have a limit of 226 pixels This checks how many you have remaining.\nLines with the big font take double the pixel space.\n\nAuto-text replacer\nTriple space inserts a IDSP(the weird Japanese space)\nTriple period becomes ellipses\n\nCharacter Counter: Shows how many pixels would be left in the text box. Tags like #PlayerName count as 72, since they have a mx size of 12 characters, and most characters are 6 pixels wide.\n\nRead the readme for more information.");
}

function showSpecialCharacters() {
    alert("Special Characters:\n\nPlayer Name = #PlayerName\nPlayer Nickname = #PlayerNickname\nPartner Name = #PartnerName\nItem Name: #ItemName\nEllipses = …\nIDSP = 　\nHeart symbol = #Heart\nPaw = #Paw\n● = #Dot");
}




// Warn user about unsaved changes when leaving page
window.onbeforeunload = function() {
    if (DIRTY) {
        return "Data will be lost if you leave the page, are you sure?";
    }
}


// Mapping of character IDs to names
const names = {
    0:"Player",
    2:"Partner",
    106:"???",
    107:"Murno",
    108:"V.E",
    109:"Tier",
    110:"Lemmy",
    111:"Jade",
    112:"Velvoren",
    113:"Thus",
    114:"Roche",
    115:"Unknown",
    116:"Unknown",
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
    "[NAME 1]" : "#PlayerNickname",
    "[NAME 2]" : "#PartnerName",
    "[NAME 4]" : "#ItemName",
    "..." : "…",
    "   " : "　",
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
    "●" : 8
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
    "i": 3,
    "j": 4,
    "k": 5,
    "l": 3,
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
    ":": 4,
    ";": 4,
    "<": 7,
    "=": 8,
    ">": 7,
    "?": 6,
    "{": 5,
    "}": 5,
    "^": 6,
    "~": 8,
    "…": 9,
    " ": 4,
    "　": 8,
    "\\": 0,
}

mainSetup();