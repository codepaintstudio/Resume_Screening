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
ALTER TABLE `users` MODIFY COLUMN `role` enum('admin','member','interviewer') NOT NULL DEFAULT 'member';--> statement-breakpoint
CREATE INDEX `user_id_idx` ON `notifications` (`user_id`);--> statement-breakpoint
CREATE INDEX `timestamp_idx` ON `notifications` (`timestamp`);--> statement-breakpoint
CREATE INDEX `unread_idx` ON `notifications` (`unread`);