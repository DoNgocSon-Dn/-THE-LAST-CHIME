import test from 'node:test';
import assert from 'node:assert/strict';
import {rebind,resetBindings} from './controls';
import {controlText} from './controlText';

test('Instruction tokens follow rebound actions without cascading replacements',()=>{
 resetBindings();rebind('interact','q');rebind('time','z');rebind('jump','x');rebind('dash','f');rebind('pulse','c');
 assert.equal(controlText('Nhấn [E], Nhấn Q, Shift / Space / R.'),'Nhấn [Q], Nhấn Z, F / X / C.');
 resetBindings();
});
test('Movement instructions change, but puzzle levers and Vietnamese prose do not',()=>{
 resetBindings();rebind('left','j');rebind('right','l');
 assert.equal(controlText('A / D · Giữ phím D. Cần A đảo I và II; cần B, C.'),'J / L · Giữ phím L. Cần A đảo I và II; cần B, C.');
 assert.equal(controlText('QUÁ KHỨ · Đô cao · THE LAST CHIME · stage_exit_1'),'QUÁ KHỨ · Đô cao · THE LAST CHIME · stage_exit_1');
 resetBindings();
});
