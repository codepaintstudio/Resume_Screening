CREATE TABLE `ai_settings` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`vision_endpoint` varchar(500),
	`vision_model` varchar(100),
	`vision_api_key` varchar(500),
	`llm_base_url` varchar(500),
	`llm_api_key` varchar(500),
	`llm_model` varchar(100),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `ai_settings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `api_keys` (
	`id` varchar(50) NOT NULL,
	`name` varchar(255) NOT NULL,
	`key` varchar(255) NOT NULL,
	`created` varchar(20) NOT NULL,
	`expires_at` varchar(20),
	CONSTRAINT `api_keys_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `github_settings` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`client_id` varchar(255),
	`client_secret` varchar(255),
	`organization` varchar(255),
	`personal_access_token` varchar(500),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `github_settings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `notification_settings` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`webhook_url` varchar(500),
	`trigger_new_resume` enum('0','1') DEFAULT '1',
	`trigger_interview_reminder` enum('0','1') DEFAULT '1',
	`trigger_offer_confirmed` enum('0','1') DEFAULT '1',
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `notification_settings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `platform_settings` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`departments` text,
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `platform_settings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `resume_import_settings` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`imap_server` varchar(255),
	`port` varchar(10),
	`account` varchar(255),
	`password` varchar(255),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `resume_import_settings_id` PRIMARY KEY(`id`)
);
