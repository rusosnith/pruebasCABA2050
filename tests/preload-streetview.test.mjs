import assert from 'node:assert/strict';
import { parseStreetViewURL, buildImageQueryParams } from '../scripts/preload-streetview.mjs';

const url = 'https://www.google.com/maps/@-34.5706263,-58.4757463,3a,90y,172.4h,92.43t/data=!3m8!1e1!3m6!1s_nnYC8_I-qxBMA3qY6Xy3A!2e0!5s20151001T000000!6shttps:%2F%2Fstreetviewpixels-pa.googleapis.com%2Fv1%2Fthumbnail%3Fcb_client%3Dmaps_sv.tactile%26w%3D900%26h%3D600%26pitch%3D-2.434849756316609%26panoid%3D_nnYC8_I-qxBMA3qY6Xy3A%26yaw%3D172.40459482211702!7i13312!8i6656?entry=ttu';

const parsed = parseStreetViewURL(url);
assert.ok(parsed);
assert.equal(parsed.fov, 90);
assert.equal(parsed.heading, 172.40459482211702);
assert.equal(parsed.pitch, -2.434849756316609);

const params = buildImageQueryParams(parsed, 'https://streetviewpixels-pa.googleapis.com/v1/thumbnail');
assert.equal(params.get('pitch'), '-2.434849756316609');
assert.equal(params.get('yaw'), '172.40459482211702');
assert.equal(params.get('panoid'), '_nnYC8_I-qxBMA3qY6Xy3A');
assert.equal(params.get('w'), '900');
assert.equal(params.get('h'), '600');
assert.equal(params.get('fov'), '90');
