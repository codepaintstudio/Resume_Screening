-- 创建 notifications 通知表

CREATE TABLE IF NOT EXISTS notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT DEFAULT NULL COMMENT '关联用户，不指定则为全局通知',
  type VARCHAR(50) NOT NULL COMMENT '通知类型: interview, resume, system',
  title VARCHAR(255) NOT NULL,
  description TEXT,
  time VARCHAR(50) COMMENT '显示用时间字符串',
  timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  unread ENUM('0', '1') NOT NULL DEFAULT '1',
  INDEX user_id_idx (user_id),
  INDEX timestamp_idx (timestamp),
  INDEX unread_idx (unread)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='通知表';

-- 查看表结构
-- DESCRIBE notifications;
