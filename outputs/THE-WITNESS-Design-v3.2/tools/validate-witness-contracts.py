"""Validate v3 design data and model its gate policy. This is not runtime QA."""
from copy import deepcopy
from itertools import product
import json
from pathlib import Path
import re


def validate_contracts(source):
    source = Path(source)
    campaign = json.loads((source / 'campaign-contract.json').read_text(encoding='utf-8'))
    design = json.loads((source / 'design-contract.json').read_text(encoding='utf-8'))
    checks = []
    cases = 0

    def check(condition, message):
        nonlocal cases
        cases += 1
        if not condition:
            raise AssertionError(message)

    check(campaign['documentVersion'] == design['documentVersion'] == '3.0', 'v3 document versions')
    check(len(design['documentFiles']) == len(set(design['documentFiles'])) == 21, 'explicit v3 spine and depth document manifest')
    depth = json.loads((source / 'depth-contract.json').read_text(encoding='utf-8'))
    check(depth['revision'] == design['depthExpansion']['revision'] == '3.2', 'depth revision')
    check(depth['runtimeRelease'] == design['depthExpansion']['runtimeRelease'] == '0.5.0', 'depth release')
    check(not depth['schemaChange'], 'depth preserves save schema')
    check(len(depth['encounters']) == len({e['id'] for e in depth['encounters']}) == 25, '25 unique runtime encounters')
    check(len({e['owner'] for e in depth['encounters']}) == 21, '21 existing scene owners')
    check(len({e['type'] for e in depth['encounters']}) == 7, 'seven mechanic families')
    check(all(e['actions'] and e['revision'] == 1 for e in depth['encounters']), 'encounters bind actions and revisions')
    craft = json.loads((source / 'craft-contract.json').read_text(encoding='utf-8'))
    check(craft['revision'] == depth['revision'] and craft['runtimeRelease'] == depth['runtimeRelease'], 'scene craft revision and release')
    check(craft['defaultWorkMode'] == 'field' and craft['boardAlternative'], 'field default and equivalent board alternative')
    check(craft['chapterActivities'] == 25 and craft['relationshipActivities'] == 6 and craft['totalActivities'] == 31, 'chapter and relationship activity counts')
    check(len(craft['owners']) == craft['sceneOwnerCount'] == 27, '27 authored scene owners')
    check({o['id'] for o in craft['owners']} == {e['owner'] for e in depth['encounters']} | {f'B{i:02}' for i in range(1,7)}, 'chapter and bond scene ownership')
    details = [d for owner in craft['owners'] for d in owner['details']]
    check(len(details) == len({d['id'] for d in details}) == craft['physicalDetailCount'] == 44, '44 unique physical details')
    check(all(d['anchor'] and d['kind'] and d['title'] for d in details), 'detail anchors, materials and readable titles')
    check(len(craft['relationshipActivitiesCatalog']) == len({e['id'] for e in craft['relationshipActivitiesCatalog']}) == 6, 'six distinct relationship activities')
    check(all(len(e['choices']) == 2 and e['revision'] == 1 for e in craft['relationshipActivitiesCatalog']), '12 authored relationship variants')
    check(all(craft['boundary'][key] is False for key in ['fieldDraftCommitsQuest','inspectionGrantsEvidence','legendWritesMortalInventory','changesCanonicalOutcomes','griefArrangementHasCorrectAnswer']), 'field, inspection and source boundaries')
    check(craft['boundary']['expertReview'] == 'unassigned' and craft['boundary']['humanPlaytest'] == 'not yet run', 'scene craft does not invent review or human acceptance')
    checks.append('31 activities, 44 physical details, 27 scene owners, 12 bond variants and field/inspection boundaries')
    check(design['runtimeCompatibility']['fullProductionScopeImplemented'] is False, 'prototype does not claim full production scope')
    check(design['saveSchemaVersion'] == campaign['designProgressionSchemaVersion'] == 2, 'proposed schema')
    budget = campaign['budget']
    check(budget == design['contentBudget'], 'matching content budgets')
    check(budget == dict(bridgeQuests=12, relationshipQuests=6, legends=5,
                        requiredLegends=3, optionalLegends=2, veils=4, hubs=3, companions=4), 'fixed scope')
    chapters = campaign['chapters']
    qmap = {q['id']: q for q in chapters}
    lmap = {l['id']: l for l in campaign['legends']}
    order = campaign['narrativeSpine']['requiredOrder']
    check(order == ['L01', 'L02', 'L04'], 'required spine order')
    check(campaign['narrativeSpine']['primaryLayer'] == 'legend', 'primary layer')
    check({l['id'] for l in lmap.values() if l['required']} == set(order), 'exactly three required')
    check(set(lmap) == {s['id'] for s in design['canonicalScenes']}, 'same five canonical IDs')
    check([q['id'] for q in chapters] == [f'Q{i:02}' for i in range(1, 13)], 'stable Q order')
    check([a['id'] for a in campaign['narrativeSpine']['acts']] == [1, 2, 3], 'three acts')
    for act, lid in zip(campaign['narrativeSpine']['acts'], order):
        check(act['required'] == [lid], 'one required Legend per act')
        check(lmap[lid]['act'] == act['id'], 'Legend act matches')
    checks.append('three required Legends, one per act, stable Q/L IDs and scope')

    policy = campaign['legendCompletionPolicy']
    check(not policy['selectingFormatCompletes'] and not policy['exitCompletes'], 'no empty skip')
    check(not policy['reflectionRequired'] and not policy['gateBypassAllowed'], 'no belief gate or bypass')
    check(not policy['replayWritesCampaign'], 'replay isolation')
    check(set(policy['formats']) == {'interactive', 'accessible_summary'}, 'equivalent formats')
    check(set(policy['optionalContentMayBeOmitted']) == {'L03', 'L05', 'V01', 'V02', 'V03', 'V04'}, 'optional set')
    check(design['layers']['legend']['mayWrite'] == ['legendProgress', 'campaignProgress.requiredLegends', 'unlockedBridgeContext'], 'Legend write whitelist')
    check({'evidence', 'consent', 'npcGuilt', 'salvationScore', 'mortalInventory', 'relationships'} <= set(design['layers']['legend']['forbidden']), 'cross-layer protections')
    check({'evidence', 'inventory', 'consent', 'npcGuilt', 'salvationScore'} <= set(design['layers']['veil']['forbidden']), 'Veil protections')
    checks.append('summary parity, unfinished exits, null reflection and cross-layer write constraints')

    assets = set()
    for i, lid in enumerate(order):
        legend = lmap[lid]
        gate = legend['gate']
        previous = qmap[gate['afterBridgeCommit']]
        following = qmap[gate['beforeBridgeEntry']]
        check(previous['next'] == following['id'], 'gate at adjacent bridges')
        check(previous['postCommitGate'] == gate['id'], 'source bridge gate')
        check(following['entryRequiredLegends'] == [lid], 'destination checks Legend')
        check(gate['requiresEarlierLegends'] == order[:i], 'no out-of-order required Legend')
        check(previous['legends'].count(lid) == 1, 'Legend scheduled exactly once at gate')
        check(sum(q['legends'].count(lid) for q in chapters) == 1, 'no duplicate schedules')
        beats = [b['id'] for b in legend['coreBeats']]
        check(beats == [lid + f'.B{j:02}' for j in range(1, len(beats)+1)], 'ordered core IDs')
        check(len(beats) == (6 if lid == 'L01' else 5), 'expected core coverage')
        scene_beats = [b for scene in legend['scenes'] for b in scene['coreBeatsDelivered']]
        summary_beats = [b for page in legend['summaryPages'] for b in page['delivers']]
        check(scene_beats == summary_beats == beats, 'interactive/summary ordered core parity')
        check(sum(s['minutes'] for s in legend['scenes']) == sum(legend['sceneMinutes']) == legend['minutes']['interactive'], 'scene duration sum')
        check(len(legend['scenes']) == 7, 'seven authored scenes')
        for b in legend['coreBeats']:
            scene = next(s for s in legend['scenes'] if s['id'] == b['receiptAtScene'])
            check(b['id'] in scene['coreBeatsDelivered'], 'receipt source scene matches')
        graph = legend['explorationGraph']
        check(all(a in graph['nodes'] and b in graph['nodes'] for a,b in graph['edges']), 'level graph edges resolve')
        routes = graph['explorationRoutes']
        check(len(routes) >= 2 and len({r['id'] for r in routes}) == len(routes), 'two identified exploration routes')
        edges = {tuple(e) for e in graph['edges']} | {tuple(reversed(e)) for e in graph['edges']}
        for route in routes:
            check(all(n in graph['nodes'] for n in route['nodes']), 'route nodes resolve')
            check(all((a,b) in edges for a,b in zip(route['nodes'],route['nodes'][1:])), 'route can be traversed')
        check(not graph['historicalScaleClaim'], 'art map not historical measurement')
        check(legend['sourcePacket']['approvedTextRevision'] is None, 'no fabricated text approval')
        check(legend['sourcePacket']['translationEdition'] is None, 'unselected translation explicit')
        check(legend['worldPacket']['finalArtApproved'] is False, 'no fabricated art approval')
        check(legend['bridge']['reflectionNullAllowed'] and not legend['bridge']['evidenceWrites'], 'bridge boundary')
        check(set(legend['reviewerSlots']) == {f'R{x:02}' for x in range(1,8)}, 'review scope')
        for aid in legend['worldPacket']['assetIds']:
            check(aid not in assets, 'unique Legend asset IDs')
            assets.add(aid)
    checks.append('16 core beats mapped in order to scenes and summary pages; level routes, packets and gates resolve')

    times = campaign['timeBudget']
    check(sum(q['targetMinutes'] for q in chapters) == times['bridgeQuestMinutes'] == 402, 'Q time budget')
    check(sum(a['travelMinutes'] for a in campaign['narrativeSpine']['acts']) == times['bridgeTravelMinutes'] == 66, 'travel budget')
    check(times['bridgeQuestMinutes'] + times['bridgeTravelMinutes'] == times['mortalBridgeMinutes'] == 468, 'Mortal subtotal')
    legend_minutes = sum(lmap[lid]['minutes']['interactive'] for lid in order)
    summary_minutes = sum(lmap[lid]['minutes']['accessible_summary'] for lid in order)
    check(legend_minutes == times['requiredLegendMinutes'] == 216, 'required 216 minutes')
    check(sum(times['veilMinutes'].values()) == times['optionalVeilMinutesInSampleRoute'] == 36, 'Veil subtotal')
    check(legend_minutes + 468 + 36 == times['baselineMinutes'] == 720, '720 minute route')
    check(legend_minutes / times['baselineMinutes'] == times['requiredLegendShare'] == .3, '30 percent target')
    check(720-36 == times['withoutVeilMinutes'] == 684, 'no-Veil route')
    check(468+36+summary_minutes == times['summaryRouteMinutes'] == 527, 'summary duration')
    check(468+summary_minutes == times['summaryRouteWithoutVeilMinutes'] == 491, 'summary without Veil')
    check(sum(lmap[lid]['targetActiveExplorationMinutes'] for lid in order) == times['interactiveLegendActiveExplorationTargetMinutes'] == 152, 'active exploration estimate')
    checks.append('all duration sums: 216/720=30%, optional-free and summary routes reported separately')

    # A small design-policy model; it deliberately does not import game runtime code.
    def eligible(legend, state, receipts, acknowledged=True, replay=False):
        if not legend['required'] or replay or not acknowledged:
            return False
        gate = legend['gate']
        if state['bridges'].get(gate['afterBridgeCommit']) != 'committed':
            return False
        if any(state['legends'].get(lid) != lmap[lid]['coreRevision'] for lid in gate['requiresEarlierLegends']):
            return False
        if [r['beat'] for r in receipts] != [b['id'] for b in legend['coreBeats']]:
            return False
        return all(r['revision'] == legend['coreRevision'] and r['format'] in legend['formats']
                   and r['legend'] == legend['id'] for r in receipts)

    for lid in order:
        legend = lmap[lid]
        before = legend['gate']['afterBridgeCommit']
        state = {'bridges': {before:'committed'}, 'legends': {p:lmap[p]['coreRevision'] for p in legend['gate']['requiresEarlierLegends']}, 'reflection': None}
        beats = [b['id'] for b in legend['coreBeats']]
        # Every mixed-format sequence, for every preceding bridge route.
        for route, formats in product(qmap[before]['routes'], product(*[legend['formats'] for _ in beats])):
            receipts = [dict(legend=lid, beat=b, revision=legend['coreRevision'], format=f) for b,f in zip(beats,formats)]
            check(eligible(legend,state,receipts), f'{lid}: complete {route}/{formats}')
        good = [dict(legend=lid, beat=b, revision=legend['coreRevision'], format='interactive') for b in beats]
        check(not eligible(legend,state,[]), 'format selection alone cannot open gate')
        for n in range(len(good)):
            check(not eligible(legend,state,good[:n]), 'any partial delivery remains blocked')
        check(not eligible(legend,state,list(reversed(good))), 'out-of-order delivery blocked')
        check(not eligible(legend,state,good+[good[-1]]), 'duplicate receipt sequence blocked')
        check(not eligible(legend,state,good,acknowledged=False), 'no final acknowledgment blocked')
        check(not eligible(legend,state,good,replay=True), 'replay cannot grant campaign gate')
        old = deepcopy(good);old[0]['revision']='2.0'
        check(not eligible(legend,state,old), 'old core revision blocked')
        wrong = deepcopy(good);wrong[0]['legend']='L03'
        check(not eligible(legend,state,wrong), 'wrong Legend receipt blocked')
        missing = deepcopy(state);missing['bridges']={}
        check(not eligible(legend,missing,good), 'preceding Q uncommitted blocked')
        if legend['gate']['requiresEarlierLegends']:
            missing = deepcopy(state);missing['legends']={}
            check(not eligible(legend,missing,good), 'earlier required Legend missing blocked')
    checks.append('design model: all 320 bridge-route/mixed-format complete paths; partial, out-of-order, replay, revision and prerequisite failures')

    # Legacy booleans must not masquerade as current-core completion.
    def finale(progress):
        return all(progress.get(lid) == lmap[lid]['coreRevision'] for lid in order)
    current = {lid:lmap[lid]['coreRevision'] for lid in order}
    check(finale(current), 'all three permit finale')
    for lid in order:
        absent = deepcopy(current);absent.pop(lid)
        check(not finale(absent), 'any missing Legend blocks finale')
    check(not finale({lid:True for lid in order}), 'legacy completed booleans not sufficient')
    check(not finale({lid:'2.0' for lid in order}), 'legacy revision not sufficient')
    roster = campaign['reviewerRoster']
    check([r['id'] for r in roster] == [f'R{i:02}' for i in range(1,8)], 'seven reviewer slots')
    check(all(r['assignee'] is None and r['approval'] is None and r['status']=='unassigned' for r in roster), 'no invented reviewers or approvals')
    checks.append('finale requires all current cores; legacy status cannot bypass; seven reviewer slots explicitly unassigned')

    slice_spec = design['verticalSlice']
    check(sum(slice_spec['stageMinutes']) == slice_spec['targetMinutes'] == 90, 'slice duration')
    check(slice_spec['legendExcerptMinutes']/slice_spec['targetMinutes'] == .3, 'slice 30 percent estimate')
    check(90-27+8 == slice_spec['summaryRouteMinutes'] == 71, 'slice summary duration')
    check(not slice_spec['excerptCompletionWritesCampaign'], 'excerpt cannot certify full campaign')
    check(slice_spec['study']['interactive']+slice_spec['study']['accessibleSummary']==slice_spec['study']['plannedParticipants']==12, 'study sample')
    check(slice_spec['humanPlaytestStatus']==slice_spec['study']['status']=='not-run', 'no fabricated study results')
    checks.append('90-minute slice/71-minute summary targets, excerpt isolation and planned unrun study')

    all_text = '\n'.join((source/name).read_text(encoding='utf-8') for name in design['documentFiles'])
    for stale in ['Skip cả L/V', 'Skipping Legends and Veils never', 'Skip records completion', 'Cả hai được bỏ qua mà không mất lối cứu người', 'Bỏ qua L không chặn']:
        check(stale not in all_text+'\n'+json.dumps(campaign)+'\n'+json.dumps(design), 'obsolete invariant removed: '+stale)
    for lid in order:
        check(re.search(r'^## '+lid+r' ', (source/'14-legends-depth-dossiers.md').read_text(encoding='utf-8'), re.M), 'deep Legend dossier')
        for suffix in ['SOURCE', 'WORLD']:
            check('## '+lid+'.'+suffix in (source/'15-source-world-packets.md').read_text(encoding='utf-8'), 'both packets per Legend')
    checks.append('active docs remove blanket skip and include all three depth dossiers and six packets')
    return {'version':'3.0','status':'passed','scope':'design-data-and-policy-model-only; not runtime, expert review or human playtest',
            'assertions':cases,'completeMixedFormatBridgePaths':320,'requiredLegends':order,'coreBeats':16,
            'sourceWorldPackets':6,'reviewerSlots':7,'assignedReviewers':0,'checks':checks}


if __name__ == '__main__':
    root = Path(__file__).resolve().parents[1]
    source = root/'docs'/'the-witness'
    if not source.exists():
        source = root/'sources'
    print(json.dumps(validate_contracts(source),ensure_ascii=False,indent=2))
