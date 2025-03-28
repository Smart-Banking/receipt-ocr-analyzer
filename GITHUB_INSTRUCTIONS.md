# Как да направите Push на проекта към GitHub

Това са стъпки за ръчно изпращане на проекта към GitHub:

## 1. Създаване на GitHub репозитори

1. Отидете на https://github.com/ и влезте в акаунта си
2. Натиснете бутона "New" (или "+" в горния десен ъгъл и изберете "New repository")
3. Задайте име на репозиторито, например "receipt-ocr-analyzer"
4. Добавете кратко описание (по желание)
5. Изберете дали искате публично или частно репозитори
6. НЕ инициализирайте репозиторито с README, .gitignore или license
7. Натиснете "Create repository"

## 2. Push на кода от Replit

### Използване на SSH (препоръчително)

1. Добавете SSH ключ към вашия GitHub акаунт, ако все още нямате: 
   - Генерирайте ключ с командата: `ssh-keygen -t ed25519 -C "your_email@example.com"`
   - Добавете публичния ключ (~/.ssh/id_ed25519.pub) към GitHub в Settings > SSH and GPG keys

2. В терминала на Replit, изпълнете следните команди:

```bash
# Инициализирайте git репозитори, ако все още не е инициализирано
git init

# Добавете всички файлове към индекса
git add .

# Направете първия къмит
git commit -m "Initial commit"

# Добавете отдалеченото репозитори (заменете URL с вашия)
git remote add origin git@github.com:YOUR_USERNAME/receipt-ocr-analyzer.git

# Изпратете кода към GitHub
git push -u origin main
```

### Използване на HTTPS (ако предпочитате)

Ако искате да използвате HTTPS вместо SSH, използвайте следния URL формат:

```bash
git remote add origin https://github.com/YOUR_USERNAME/receipt-ocr-analyzer.git
```

При използване на HTTPS, GitHub ще ви поиска вашите потребителско име и персонален токен за достъп (Personal Access Token) вместо парола. Можете да генерирате такъв от GitHub > Settings > Developer settings > Personal access tokens.

## 3. Допълнителни команди

За бъдещи промени по кода:

```bash
# Добавяне на промените
git add .

# Къмитване
git commit -m "Добавена нова функционалност"

# Изпращане към GitHub
git push
```

## Забележка

Ако имате инсталиран GitHub CLI (gh), можете да използвате и следния алтернативен подход:

```bash
# Инициализация
gh repo create receipt-ocr-analyzer --private --source=. --push
```

Това ще създаде ново репозитори и автоматично ще направи push на текущата директория.