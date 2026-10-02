CREATE TABLE `wall_notes` (
	`id` text PRIMARY KEY NOT NULL,
	`body` text NOT NULL,
	`direction` text NOT NULL,
	`created_at` integer NOT NULL,
	`status` text DEFAULT 'visible' NOT NULL,
	`delete_hash` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_wall_notes_status_created` ON `wall_notes` (`status`,`created_at`,`id`);--> statement-breakpoint
CREATE TABLE `wall_rate` (
	`actor` text NOT NULL,
	`bucket` integer NOT NULL,
	`count` integer DEFAULT 1 NOT NULL,
	PRIMARY KEY(`actor`, `bucket`)
);
--> statement-breakpoint
CREATE TABLE `wall_reports` (
	`note_id` text NOT NULL,
	`actor` text NOT NULL,
	`created_at` integer NOT NULL,
	PRIMARY KEY(`note_id`, `actor`)
);
