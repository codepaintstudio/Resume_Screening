-- 添加 location 字段到 interviews 表
-- 如果字段已存在会报错，使用 IF NOT EXISTS 或自行检查

ALTER TABLE interviews ADD COLUMN IF NOT EXISTS location VARCHAR(255);

-- 查看表结构确认
DESCRIBE interviews;
