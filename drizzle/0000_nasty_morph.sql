CREATE TABLE `activity_logs` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`user` varchar(255) NOT NULL,
	`action` varchar(500) NOT NULL,
	`time` varchar(50),
	`timestamp` timestamp NOT NULL DEFAULT (now()),
	`role` varchar(100),
	`avatar` varchar(500),
	`user_id` int,
	CONSTRAINT `activity_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
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
CREATE TABLE `comments` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`student_id` int NOT NULL,
	`user` varchar(255) NOT NULL,
	`role` varchar(100),
	`avatar` varchar(500),
	`content` text NOT NULL,
	`time` varchar(50),
	`timestamp` timestamp NOT NULL DEFAULT (now()),
	`user_id` int,
	CONSTRAINT `comments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `email_config` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`host` varchar(255) NOT NULL,
	`port` varchar(10) NOT NULL,
	`user` varchar(255) NOT NULL,
	`pass` varchar(255) NOT NULL,
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `email_config_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `email_history` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`template_name` varchar(255) NOT NULL,
	`subject` varchar(500) NOT NULL,
	`content` text NOT NULL,
	`recipients` json,
	`recipient_count` int NOT NULL DEFAULT 0,
	`status` enum('success','failed','partial') NOT NULL DEFAULT 'success',
	`sent_at` timestamp DEFAULT (now()),
	CONSTRAINT `email_history_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `email_templates` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`subject` varchar(500) NOT NULL,
	`content` text NOT NULL,
	`category` varchar(100) NOT NULL,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `email_templates_id` PRIMARY KEY(`id`)
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
CREATE TABLE `interviews` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`student_id` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`major` varchar(255),
	`department` varchar(255),
	`time` varchar(50),
	`interview_date` date,
	`location` varchar(255),
	`priority` enum('low','medium','high') NOT NULL DEFAULT 'medium',
	`stage` enum('pending','to_be_scheduled','pending_interview','interviewing','passed','rejected') NOT NULL DEFAULT 'pending',
	`gpa` varchar(10),
	`ai_score` decimal(5,2) DEFAULT '0',
	`tags` json,
	`email` varchar(255),
	`phone` varchar(50),
	`class_name` varchar(100),
	`skills` json,
	`experiences` json,
	`interviewers` json,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `interviews_id` PRIMARY KEY(`id`)
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
CREATE TABLE `notifications` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`user_id` int,
	`type` varchar(50) NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`time` varchar(50),
	`timestamp` timestamp NOT NULL DEFAULT (now()),
	`unread` enum('0','1') NOT NULL DEFAULT '1',
	CONSTRAINT `notifications_id` PRIMARY KEY(`id`)
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
--> statement-breakpoint
CREATE TABLE `students` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`student_id` varchar(50),
	`department` varchar(255),
	`major` varchar(255),
	`class_name` varchar(100),
	`gpa` varchar(10),
	`graduation_year` varchar(10),
	`status` enum('pending','to_be_scheduled','pending_interview','interviewing','passed','rejected') NOT NULL DEFAULT 'pending',
	`tags` json,
	`ai_score` decimal(5,2) DEFAULT '0',
	`submission_date` date,
	`email` varchar(255),
	`phone` varchar(50),
	`resume_pdf` varchar(500),
	`experiences` json,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `students_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`email` varchar(255) NOT NULL,
	`name` varchar(255) NOT NULL,
	`role` enum('admin','member','interviewer') NOT NULL DEFAULT 'member',
	`password` varchar(255) NOT NULL,
	`avatar` varchar(500),
	`department` varchar(255),
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
CREATE INDEX `student_id_idx` ON `comments` (`student_id`);--> statement-breakpoint
CREATE INDEX `student_id_idx` ON `interviews` (`student_id`);--> statement-breakpoint
CREATE INDEX `stage_idx` ON `interviews` (`stage`);--> statement-breakpoint
CREATE INDEX `date_idx` ON `interviews` (`interview_date`);--> statement-breakpoint
CREATE INDEX `user_id_idx` ON `notifications` (`user_id`);--> statement-breakpoint
CREATE INDEX `timestamp_idx` ON `notifications` (`timestamp`);--> statement-breakpoint
CREATE INDEX `unread_idx` ON `notifications` (`unread`);--> statement-breakpoint
CREATE INDEX `status_idx` ON `students` (`status`);--> statement-breakpoint
CREATE INDEX `department_idx` ON `students` (`department`);