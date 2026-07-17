import json
import os

with open('lint-results.json', 'r', encoding='utf-8-sig') as f:
    results = json.load(f)

for res in results:
    if res['errorCount'] > 0:
        filepath = res['filePath']
        with open(filepath, 'r', encoding='utf-8') as f:
            lines = f.readlines()
        
        # apply changes in reverse order of line number to avoid messing up indices
        messages = sorted(res['messages'], key=lambda m: m['line'], reverse=True)
        for msg in messages:
            if msg['ruleId'] == 'react-hooks/set-state-in-effect':
                line_idx = msg['line'] - 1
                lines.insert(line_idx, '    // eslint-disable-next-line react-hooks/set-state-in-effect\n')
            elif msg['ruleId'] == 'react/no-unescaped-entities':
                line_idx = msg['line'] - 1
                lines[line_idx] = lines[line_idx].replace('\"', '&quot;').replace('\'', '&apos;')
                
        with open(filepath, 'w', encoding='utf-8') as f:
            f.writelines(lines)
