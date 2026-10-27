// 실제 플랫폼의 화면/권한 검증을 대신하지 않는 커스텀 모듈 동작 검사입니다.
const fs = require('fs'), vm = require('vm'), assert = require('assert/strict'), path = require('path');
let api, networkMode = 'ok', pendingResponse, requests = [];
const response = rows => ({success: true, type: 'sdxECChangeAction', attributes: rows});
let payload;
vm.runInNewContext(fs.readFileSync(path.join(__dirname,
    '../webapps/sdxECCAAutoClass/sdxECCAAttributeVisibility.js'), 'utf8'), {
    define(id, deps, factory) {
        api = factory((ids, done) => done({authenticatedRequest(url, options) {
            requests.push({url, options});
            if (networkMode === 'failure') { options.onFailure(); return; }
            if (url.endsWith('/CSRF')) {
                options.onComplete({csrf: {name: 'ENO_CSRF_TOKEN', value: 'test-token'}});
                return;
            }
            assert.equal(options.headers.ENO_CSRF_TOKEN, 'test-token');
            assert.equal(options.timeout, 5000);
            if (networkMode === 'timeout') { options.onTimeout(); return; }
            if (networkMode === 'late') { pendingResponse = options; return; }
            options.onComplete(payload);
        }}));
    }
});
function fixture(type = 'sdxECChangeAction') {
    const fields = {};
    ['Show', 'Hide', 'Missing', 'AlreadyHidden', 'ClassOnly'].forEach(name => {
        fields[name] = {name, visible: name !== 'AlreadyHidden', value: name + '-value',
            mandatory: name === 'Hide', getIdentifier() { return this.name; }};
    });
    let handler, changes = [];
    const model = {
        getAllAttributes: () => fields,
        addEvent(event, fn) { handler = fn; },
        removeEvent(event, fn) { if (handler === fn) handler = null; }
    };
    const session = {type, status: 'ready', context: 'ctx::Leader.Org.Space'};
    const facet = {listview: {
        propModel: model,
        data: {attributes: {
            publicAttributes: [{name: 'Show'}, {name: 'Hide'}, {name: 'Missing'}],
            extensionAttributes: [{name: 'Hide'}, {name: 'AlreadyHidden'}]
        }},
        addAttributeOnUI(id, visible) { fields[id].visible = visible; changes.push(id); }
    }};
    return {fields, session, facet, changes, notify() { if (handler) handler(); }};
}
const options = {url: '/resources/v1/modeler/sdxECCA/attributes/visibility',
    service: {get3DSpaceUrl: () => Promise.resolve('https://space.example/3dspace/')}};
const tick = () => new Promise(resolve => setImmediate(resolve));
(async () => {
    payload = response([{name: 'Show', searchable: true}, {name: 'Hide', searchable: false},
        {name: 'AlreadyHidden', searchable: true}]);
    let f = fixture();
    const cleanup = await api.install(f.facet, f.session, options);
    assert.deepEqual(f.changes, ['Hide']);
    assert.equal(f.fields.Missing.visible, true);
    assert.equal(f.fields.AlreadyHidden.visible, false);
    assert.equal(f.fields.ClassOnly.visible, true);
    assert.equal(f.fields.Hide.value, 'Hide-value');
    assert.equal(f.fields.Hide.mandatory, true);
    const sent = JSON.parse(requests[1].options.data);
    assert.deepEqual(sent, ['Show', 'Hide', 'Missing', 'AlreadyHidden']);
    f.fields.Hide.visible = true; f.notify();
    assert.equal(f.fields.Hide.visible, false); // BL 갱신으로 표시가 바뀌어도 재적용
    cleanup();f.fields.Hide.visible = true;f.notify();assert.equal(f.fields.Hide.visible, true);

    for (const bad of [response([{name:'Hide',searchable:'false'}]),
        response([{name:'Hide',searchable:false},{name:'Hide',searchable:false}]),
        response([{name:'Unrequested',searchable:false}]), {success:false}, '<html>login</html>']) {
        payload = bad;f = fixture();
        await assert.rejects(api.install(f.facet, f.session, options));
        assert.equal(f.changes.length, 0);
    }
    for (const mode of ['failure', 'timeout']) {
        networkMode = mode; f = fixture();
        await assert.rejects(api.install(f.facet, f.session, options));
        assert.equal(f.changes.length, 0);
    }
    networkMode = 'late';f = fixture();pendingResponse = null;
    const late = api.install(f.facet, f.session, options);await tick();
    f.session.disposed = true;
    pendingResponse.onComplete(response([{name:'Hide',searchable:false}]));
    await late;assert.equal(f.changes.length,0);
    networkMode='late';f=fixture();pendingResponse=null;
    const pending=api.install(f.facet,f.session,options);await tick();f.session.transitioning=true;
    pendingResponse.onComplete(response([{name:'Hide',searchable:false}]));await pending;
    assert.equal(f.changes.length,0);
    networkMode = 'ok';requests=[];
    f=fixture('Change Action');await api.install(f.facet,f.session,options);
    f=fixture();await api.install(f.facet,f.session,{url:''});assert.equal(requests.length,0);
    await assert.rejects(api.install(f.facet,f.session,{...options,url:'https://other.example/visibility'}));
    assert.equal(requests.length,0);
    console.log('PASS: target scope, deduplicated batch, CSRF, false-only hiding, missing/error fail-open, values/mandatory preserved, BL refresh, cleanup, late responses');
})().catch(error => {console.error(error);process.exitCode=1;});
