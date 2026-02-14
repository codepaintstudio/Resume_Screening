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
	`role` enum('admin','member') NOT NULL DEFAULT 'member',
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
CREATE INDEX `status_idx` ON `students` (`status`);--> statement-breakpoint
CREATE INDEX `department_idx` ON `students` (`department`);