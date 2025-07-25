// wdio.firefox.conf.ts
// extends the main configuration file changing first participant to be Firefox
import { merge } from 'lodash-es';
import process from 'node:process';

// @ts-ignore
import { config as defaultConfig } from './wdio.conf.ts';

const ffArgs = [];

const ffPreferences = {
    'intl.accept_languages': 'en-US',
    'media.navigator.permission.disabled': true,
    'media.navigator.streams.fake': true,
    'media.autoplay.default': 0
};

if (process.env.HEADLESS === 'true') {
    ffArgs.push('--headless');
}

const mergedConfig = merge(defaultConfig, {
    exclude: [
        'specs/**/iFrameApi*.spec.ts', // FF does not support uploading files (uploadFile)

        // FF does not support setting a file as mic input, no dominant speaker events
        'specs/3way/activeSpeaker.spec.ts',
        'specs/3way/startMuted.spec.ts', // bad audio levels
        'specs/4way/desktopSharing.spec.ts',
        'specs/4way/lastN.spec.ts',

        // when unmuting a participant, we see the presence in debug logs imidiately,
        // but for 15 seconds it is not received/processed by the client
        // (also the menu disappears after clicking one of the moderation options, does not happen manually)
        'specs/3way/audioVideoModeration.spec.ts'
    ],
    capabilities: {
        p1: {
            capabilities: {
                browserName: 'firefox',
                browserVersion: process.env.BROWSER_FF_BETA ? 'beta' : undefined,
                'moz:firefoxOptions': {
                    args: ffArgs,
                    prefs: ffPreferences
                },
                acceptInsecureCerts: process.env.ALLOW_INSECURE_CERTS === 'true'
            }
        }
    }
}, { clone: false });

// Remove the chrome options from the first participant
// @ts-ignore
mergedConfig.capabilities.p1.capabilities['goog:chromeOptions'] = undefined;

export const config = mergedConfig;
