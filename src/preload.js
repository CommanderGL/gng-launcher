import { ipcRenderer } from 'electron';
import { Octokit } from 'octokit';
import download from 'download';
import extract from 'extract-zip';
import fs from 'fs';
import { exec } from 'child_process';

const octokit = new Octokit({});

let showTitleBar = true;

window.addEventListener('DOMContentLoaded', () => {
    const titleBar = document.querySelector('header');

    document.querySelector('.window-action-min').addEventListener('click', () => {
        ipcRenderer.invoke('minimize-window');
    });

    document.querySelector('.window-action-max').addEventListener('click', () => {
        ipcRenderer.invoke('maximize-window');
    });

    document.querySelector('.window-action-close').addEventListener('click', () => {
        ipcRenderer.invoke('close-window');
    });

    window.addEventListener('resize', () => {
        ipcRenderer.invoke('is-fullscreen').then(isFullscreen => {
            if (isFullscreen) {
                titleBar.classList.add('header-hidden');
            } else if (showTitleBar == false && isFullscreen == false) {
                titleBar.classList.remove('header-hidden');
            }
            showTitleBar = !isFullscreen;
        });
    });

    if (window.localStorage.getItem('install-dir') == null) {
        document.querySelector('.install').removeAttribute('hidden');
        document.querySelector('.launch').setAttribute('hidden', true);
    }

    const install = async () => {
        const latestRelease = await octokit.request('GET /repos/{owner}/{repo}/releases/latest', {
            owner: "CommanderGL",
            repo: "gng"
        });
        const asset = latestRelease.data.assets.filter(asset => asset.name == 'zip-build.zip')[0];

        console.log(asset);
        await download(asset.browser_download_url, '/tmp/gng-install/');
        
        await extract('/tmp/gng-install/' + asset.name, { dir: '/tmp/gng-install/' });
        const installDir = await ipcRenderer.invoke('open-dir');
        console.log(installDir);
        fs.renameSync('/tmp/gng-install/' + asset.name.replace('.zip', ''), installDir[0]);
        window.localStorage.setItem('install-dir', installDir[0]);

        alert("Finished Installing.");

        document.querySelector('.launch').removeAttribute('hidden');
        document.querySelector('.install').setAttribute('hidden', true);
    };

    const reinstall = async () => {
        const latestRelease = await octokit.request('GET /repos/{owner}/{repo}/releases/latest', {
            owner: "CommanderGL",
            repo: "gng"
        });
        const asset = latestRelease.data.assets.filter(asset => asset.name == 'zip-build.zip')[0];

        console.log(asset);
        await download(asset.browser_download_url, '/tmp/gng-install/');
        
        await extract('/tmp/gng-install/' + asset.name, { dir: '/tmp/gng-install/' });
        const installDir = window.localStorage.getItem('install-dir');
        console.log(installDir);
        fs.rmSync(installDir, { recursive: true, force: true });
        fs.renameSync('/tmp/gng-install/' + asset.name.replace('.zip', ''), installDir);

        alert("Finished Reinstalling / Updating.");
    };

    document.querySelector('.install-btn').addEventListener('click', install);
    document.querySelector('.reinstall-btn').addEventListener('click', reinstall);
    document.querySelector('.reset-dir-btn').addEventListener('click', async () => {
        window.localStorage.setItem('install-dir', await ipcRenderer.invoke('open-dir'));

        document.querySelector('.launch').removeAttribute('hidden');
        document.querySelector('.install').setAttribute('hidden', true);
    });

    document.querySelector('.launch-btn').addEventListener('click', () => {
        exec(`cd ${window.localStorage.getItem('install-dir')}/bin && exec ./gng`, (err, stdo, stde) => {
            if (err) {
                console.error(err.message);
                return;
            }
            if (stde) {
                console.error(stde);
                return;
            }
            console.log(stdo);
        });
    });
});