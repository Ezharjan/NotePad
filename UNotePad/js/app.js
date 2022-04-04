$(document).ready(function () {
    const welcomeText = `This is an offline-capable Notepad which is a Progressive Web App.

	The app serves the following features:

	- Write notes which are then saved to the localStorage.
	- Installable on supported browsers for offline usage.
	- "Add To Home Screen" feature on Android-supported devices to launch the app from the home screen.
	- Dark mode.
	- Privacy-focused - We'll never collect your precious data.
	- Light-weight - Loads almost instantly.
	- It's open-source!

	CAUTION: Since the app uses the browser's localStorage to store your notes, 
	it's recommended that you take backup of your notes more often using the 
	"Download Notes" button or by pressing "Ctrl/Cmd + S" keys.

	** Start writing your notes **`;

    const darkModeText = 'Enable dark mode';
    const lightModeText = 'Enable light mode';
    let uyghurModeTexts = 'Enable Uyghurche'
    let englishModeText = 'Enable English'

    const darkMetaColor = '#0d1117';
    const lightMetaColor = '#795548';
    const metaThemeColor = document.querySelector('meta[name=theme-color]');

    if (localStorage.getItem('note') && localStorage.getItem('note') != '') {
        const noteItem = localStorage.getItem('note');
        $('#note').val(noteItem);
    } else {
        $('#note').val(welcomeText);
    }

    if (!localStorage.getItem('isUserPreferredTheme')) {
        localStorage.setItem('isUserPreferredTheme', 'false');
    }

    if (localStorage.getItem('mode') && localStorage.getItem('mode') !== '') {
        if (localStorage.getItem('mode') === 'dark') {
            enableDarkMode(lightModeText, darkMetaColor, metaThemeColor)
        } else {
            enableLightMode(darkModeText, lightMetaColor, metaThemeColor)
        }
    }

    if (localStorage.getItem('lang') && localStorage.getItem('lang') !== '') {
        if (localStorage.getItem('lang') === 'uygch') {
            enableUyghur(englishModeText)
        } else {
            enableEnglish(uyghurModeTexts)
        }
    }

    $('#note').keyup(debounce(function () {
        localStorage.setItem('note', $(this).val());
    }, 500));

    $('#clearNotes').on('click', function () {
        Swal.fire({
            title: 'Want to delete notes?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Delete'
        }).then((result) => {
            if (result.value) {
                $('#note').val('').focus();
                localStorage.setItem('note', '');

                Swal.fire(
                    'Deleted!',
                    'Your notes has been deleted.',
                    'success'
                )
            }
        })
    });

    $('#mode').click(function () {
        $(document.body).toggleClass('dark');
        let bodyClass = $(document.body).attr('class');

        console.log("sssssssssss", bodyClass)

        if (bodyClass === 'dark') {
            enableDarkMode(lightModeText, darkMetaColor, metaThemeColor)
        } else {
            enableLightMode(darkModeText, lightMetaColor, metaThemeColor)
        }

        localStorage.setItem('isUserPreferredTheme', 'true');
    });

    $('#lang').click(function () {
        var targetNode = document.getElementById('note');
        changeDirection(targetNode, !isGlobalUyghur);///this function and the last param is from uygch.js
        isGlobalUyghur ? enableUyghur(englishModeText) : enableEnglish(uyghurModeTexts)
        isGlobalUyghur = !isGlobalUyghur
    });

    $('#copyToClipboard').click(function () {
        navigator.clipboard.writeText($('#note').val()).then(function () {
            showToast('Notes copied to clipboard!')
        }, function () {
            showToast('Failure to copy. Check permissions for clipboard.')
        });
    })

    $('#downloadNotes').click(function () {
        saveTextAsFile(note.value, getFileName());
    })

    // This changes the application's theme when 
    // user toggles device's theme preference
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', ({ matches }) => {
        // To override device's theme preference
        // if user sets theme manually in the app
        if (localStorage.getItem('isUserPreferredTheme') === 'true') {
            return;
        }

        if (matches) {
            enableDarkMode(lightModeText, darkMetaColor, metaThemeColor)
        } else {
            enableLightMode(darkModeText, lightMetaColor, metaThemeColor)
        }
    });

    // This sets the application's theme based on
    // the device's theme preference when it loads
    if (localStorage.getItem('isUserPreferredTheme') === 'false') {
        if (
            window.matchMedia('(prefers-color-scheme: dark)').matches
        ) {
            enableDarkMode(lightModeText, darkMetaColor, metaThemeColor)
        } else {
            enableLightMode(darkModeText, lightMetaColor, metaThemeColor)
        }
    }

    if (getPWADisplayMode() === 'standalone') {
        $('#installApp').hide();
    }

    window.matchMedia('(display-mode: standalone)').addEventListener('change', ({ matches }) => {
        if (matches) {
            $('#installApp').hide();
        } else {
            $('#installApp').show();
        }
    });

    document.onkeydown = function (event) {
        event = event || window.event;

        if (event.key === 'Escape') {
            $('#aboutModal').modal('hide');
        } else if (event.ctrlKey && event.code === 'KeyS') {
            saveTextAsFile(note.value, getFileName());
            event.preventDefault();
        }
    };
});

// Registering ServiceWorker
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').then(function (registration) {
        console.log('ServiceWorker registration successful with scope: ', registration.scope);
    }).catch(function (err) {
        console.log('ServiceWorker registration failed: ', err);
    });
}

let deferredPrompt;
let installSource;

window.addEventListener('beforeinstallprompt', (e) => {
    $('.install-app-btn-container').show();
    deferredPrompt = e;
    installSource = 'nativeInstallCard';

    e.userChoice.then(function (choiceResult) {
        if (choiceResult.outcome === 'accepted') {
            deferredPrompt = null;
        }

        ga('send', {
            hitType: 'event',
            eventCategory: 'pwa-install',
            eventAction: 'native-installation-card-prompted',
            eventLabel: installSource,
            eventValue: choiceResult.outcome === 'accepted' ? 1 : 0
        });
    });
});

const installApp = document.getElementById('installApp');

installApp.addEventListener('click', async () => {
    installSource = 'customInstallationButton';

    if (deferredPrompt !== null) {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
            deferredPrompt = null;
        }

        ga('send', {
            hitType: 'event',
            eventCategory: 'pwa-install',
            eventAction: 'custom-installation-button-clicked',
            eventLabel: installSource,
            eventValue: outcome === 'accepted' ? 1 : 0
        });
    } else {
        showToast('Notepad is already installed.')
    }
});

window.addEventListener('appinstalled', () => {
    deferredPrompt = null;

    const source = installSource || 'browser';

    ga('send', 'event', 'pwa-install', 'installed', source);
});