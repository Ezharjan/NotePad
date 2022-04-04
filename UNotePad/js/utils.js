function getFileName() {
    return 'Notes-' + getCurrentDate() + '.txt';
}

function getCurrentDate() {
    const currentDate = new Date();

    return currentDate.getDate() + '-' + (currentDate.getMonth() + 1) + '-' + currentDate.getFullYear();
}

function showToast(message) {
    let toast = document.getElementById('toast');
    toast.className = 'show';
    toast.innerHTML = message;

    setTimeout(function () {
        toast.className = toast.className.replace('show', '');
    }, 2000);
}

function debounce(func, wait, immediate) {
    let timeout;
    return function () {
        let context = this;
        let args = arguments;
        let later = function () {
            timeout = null;
            if (!immediate) {
                func.apply(context, args);
            }
        };

        let callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) {
            func.apply(context, args);
        }
    };
}

function saveTextAsFile(textToWrite, fileNameToSaveAs) {
    let textFileAsBlob = new Blob([textToWrite], { type: 'text/plain' });
    let downloadLink = document.createElement('a');
    downloadLink.download = fileNameToSaveAs;
    downloadLink.innerHTML = 'Download File';

    if (window.webkitURL != null) {
        downloadLink.href = window.webkitURL.createObjectURL(textFileAsBlob);
    } else {
        downloadLink.href = window.URL.createObjectURL(textFileAsBlob);
        downloadLink.onclick = destroyClickedElement;
        downloadLink.style.display = 'none';
        document.body.appendChild(downloadLink);
    }

    downloadLink.click();
}

function getPWADisplayMode() {
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;

    if (document.referrer.startsWith('android-app://')) {
        return 'twa';
    } else if (navigator.standalone || isStandalone) {
        return 'standalone';
    }

    return 'browser';
}

function _expr_classEnabler(parent, parentClass, toEnable, toDisable) {
    $(document.body).addClass(toEnable);
    $('.' + parentClass).removeClass(parentClass + '-default');
    $('#' + parent).attr('title', lightmodeText);
    $('#' + toDisable).show();
    $('#' + toEnable).hide();
    localStorage.setItem(parent, toEnable);
}

function enableDarkMode(lightmodeText, darkMetaColor, metaThemeColor) {
    $(document.body).addClass('dark');
    $('.navbar').removeClass('navbar-default');
    $('#mode').attr('title', lightmodeText);
    $('#light').show();
    $('#dark').hide();
    metaThemeColor.setAttribute('content', darkMetaColor);
    localStorage.setItem('mode', 'dark');
}

function enableLightMode(darkmodeText, lightMetaColor, metaThemeColor) {
    $('.navbar').addClass('navbar-default');
    $(document.body).removeClass('dark');
    $('#mode').attr('title', darkmodeText);
    $('#dark').show();
    $('#light').hide();
    metaThemeColor.setAttribute('content', lightMetaColor);
    localStorage.setItem('mode', 'light');
}

function enableEnglish(uyghurModeText) {
    $('#lang').attr('title', uyghurModeText);
    $('#uygch').show();
    $('#eng').hide();
    localStorage.setItem('lang', 'eng');
}

function enableUyghur(englishModeText) {
    $('#lang').attr('title', englishModeText);
    $('#eng').show();
    $('#uygch').hide();
    localStorage.setItem('lang', 'uygch');
}
