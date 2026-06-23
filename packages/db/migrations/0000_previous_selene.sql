CREATE TABLE `application_signals` (
	`application_id` text PRIMARY KEY NOT NULL,
	`availability_fit` text,
	`intent_signal` text,
	`gap_notes` text,
	`summary` text,
	FOREIGN KEY (`application_id`) REFERENCES `applications`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `applications` (
	`id` text PRIMARY KEY NOT NULL,
	`job_id` text NOT NULL,
	`candidate_name` text NOT NULL,
	`email` text NOT NULL,
	`phone` text,
	`cv_text` text,
	`status` text DEFAULT 'in_progress' NOT NULL,
	`redirected_to_job_id` text,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`job_id`) REFERENCES `jobs`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`redirected_to_job_id`) REFERENCES `jobs`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `applications_poll_idx` ON `applications` (`job_id`,`status`,`updated_at`);--> statement-breakpoint
CREATE TABLE `job_routes` (
	`id` text PRIMARY KEY NOT NULL,
	`from_job_id` text NOT NULL,
	`to_job_id` text NOT NULL,
	`reason` text,
	`resolves_dealbreaker` text,
	FOREIGN KEY (`from_job_id`) REFERENCES `jobs`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`to_job_id`) REFERENCES `jobs`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `job_routes_from_idx` ON `job_routes` (`from_job_id`);--> statement-breakpoint
CREATE TABLE `jobs` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`description` text NOT NULL,
	`employer` text,
	`location` text,
	`shift_pattern` text,
	`pay_range` text,
	`start_date` text,
	`preview_facts` text,
	`status` text DEFAULT 'draft' NOT NULL,
	`is_routable_target` integer DEFAULT false NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `responses` (
	`id` text PRIMARY KEY NOT NULL,
	`application_id` text NOT NULL,
	`criteria_id` text NOT NULL,
	`answer` text,
	`answer_json` text,
	`fit_flag` text,
	`explanation` text,
	FOREIGN KEY (`application_id`) REFERENCES `applications`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`criteria_id`) REFERENCES `screening_criteria`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `responses_app_criteria_uq` ON `responses` (`application_id`,`criteria_id`);--> statement-breakpoint
CREATE TABLE `screening_criteria` (
	`id` text PRIMARY KEY NOT NULL,
	`job_id` text NOT NULL,
	`type` text NOT NULL,
	`prompt` text NOT NULL,
	`help_text` text,
	`is_dealbreaker` integer DEFAULT false NOT NULL,
	`config` text,
	`rationale` text,
	`display_order` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`job_id`) REFERENCES `jobs`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `screening_criteria_job_idx` ON `screening_criteria` (`job_id`,`display_order`);