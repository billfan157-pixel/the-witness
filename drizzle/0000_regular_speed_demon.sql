CREATE TABLE `save_audit` (
	`id` text NOT NULL,
	`user_id` text NOT NULL,
	`action` text NOT NULL,
	`slot` integer NOT NULL,
	`revision` integer NOT NULL,
	`created_at` text NOT NULL,
	PRIMARY KEY(`user_id`, `id`),
	FOREIGN KEY (`user_id`) REFERENCES `players`(`user_id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `audit_user_time` ON `save_audit` (`user_id`,`created_at`);--> statement-breakpoint
CREATE TABLE `players` (
	`user_id` text PRIMARY KEY NOT NULL,
	`display_name` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `write_limits` (
	`user_id` text PRIMARY KEY NOT NULL,
	`window_start` integer NOT NULL,
	`request_count` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `players`(`user_id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `save_revisions` (
	`user_id` text NOT NULL,
	`slot` integer NOT NULL,
	`revision` integer NOT NULL,
	`data_json` text,
	`sha256` text,
	`chapter` integer,
	`character_name` text,
	`client_id` text NOT NULL,
	`mutation_id` text NOT NULL,
	`created_at` text NOT NULL,
	`deleted` integer DEFAULT 0 NOT NULL,
	PRIMARY KEY(`user_id`, `slot`, `revision`),
	FOREIGN KEY (`user_id`) REFERENCES `players`(`user_id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `revisions_mutation` ON `save_revisions` (`user_id`,`mutation_id`);--> statement-breakpoint
CREATE TABLE `game_saves` (
	`user_id` text NOT NULL,
	`slot` integer NOT NULL,
	`revision` integer NOT NULL,
	`data_json` text,
	`sha256` text,
	`chapter` integer,
	`character_name` text,
	`client_id` text NOT NULL,
	`mutation_id` text NOT NULL,
	`updated_at` text NOT NULL,
	`deleted` integer DEFAULT 0 NOT NULL,
	PRIMARY KEY(`user_id`, `slot`),
	FOREIGN KEY (`user_id`) REFERENCES `players`(`user_id`) ON UPDATE no action ON DELETE cascade
);
