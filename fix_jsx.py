files = ['src/app/auth/login/page.tsx', 'src/app/auth/register/page.tsx', 'src/app/twin/page.tsx', 'src/app/matches/page.tsx']
for f in files:
    with open(f, 'r', encoding='utf-8') as file:
        content = file.read()
    # Replace the broken syntax in login
    content = content.replace('{&quot; &quot;}', '{\" \"}')
    # Replace broken classNames
    content = content.replace('className=&quot;', 'className=\"')
    content = content.replace('&quot;>', '\">')
    # Replace broken twin line
    content = content.replace('&apos;', '\'')
    content = content.replace('&quot;', '\"')
    with open(f, 'w', encoding='utf-8') as file:
        file.write(content)
