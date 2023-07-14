// ==UserScript==
// @name         Twitch Redeem Notifier
// @namespace    twitch.tv/simplevar
// @version      0.1
// @description  notifies window.opener of redeems and raids (assumes 7tv is installed)
// @author       SimpleVar
// @match        https://www.twitch.tv/popout/SimpleVar/chat
// @icon         https://www.google.com/s2/favicons?sz=64&domain=twitch.tv
// @grant        none
// ==/UserScript==

(()=>{
    if (!window.opener) return
    waitEl('main.seventv-chat-list').then(el => { new MutationObserver(muts => { for (const m of muts) for (const n of m.addedNodes) handleMessage(n); }).observe(el, { childList: true }); })

    function fire(data) {
        console.log(data)
        window.opener.postMessage(data, '*')
    }

    function handleMessage(el) {
        const reward = el.querySelector('.reward-left')
        if (!reward) {
            // TODO raids
            return
        }
        const user = reward.querySelector('.reward-username')?.innerText
        const kind = reward.querySelector('.reward-name')?.innerText
        if (user && kind) fire({ev: 'redeem', user, kind})
        else console.warn('failed to parse redeem', reward)
    }

    function waitTruthy(pollInterval, fn) {
        return new Promise((res, _) => {
            poll()
            function poll() {
                const x = fn()
                if (x) res(x)
                else setTimeout(poll, pollInterval)
            }
        })
    }

    async function waitEl(elOrSelector, predicate = undefined, pollInterval = 100, knownParent = undefined) {
        if (!(elOrSelector instanceof HTMLElement)) {
            knownParent ??= document
            elOrSelector = await waitTruthy(pollInterval, () => knownParent.querySelector(elOrSelector))
        }
        if (predicate) await waitTruthy(pollInterval, () => predicate(elOrSelector))
        return elOrSelector
    }
})()
