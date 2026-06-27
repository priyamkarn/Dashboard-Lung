CREATE TABLE "depots" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" varchar(20) NOT NULL,
	"name" varchar(255) NOT NULL,
	"latitude" real,
	"longitude" real,
	"total_chargers" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(255) NOT NULL,
	"name" varchar(255) NOT NULL,
	"role" varchar(50) DEFAULT 'dispatcher' NOT NULL,
	"depot_id" uuid,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "buses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"fleet_number" varchar(50) NOT NULL,
	"model" varchar(100),
	"battery_capacity_kwh" real NOT NULL,
	"battery_level_pct" real DEFAULT 100 NOT NULL,
	"status" varchar(30) DEFAULT 'available' NOT NULL,
	"depot_id" uuid NOT NULL,
	"last_seen_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "routes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"route_number" varchar(20) NOT NULL,
	"description" varchar(255),
	"distance_km" real,
	"estimated_energy_kwh" real,
	"depot_id" uuid NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "dispatch_assignments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"bus_id" uuid NOT NULL,
	"route_id" uuid NOT NULL,
	"assigned_by_id" uuid,
	"scheduled_start" timestamp with time zone NOT NULL,
	"scheduled_end" timestamp with time zone NOT NULL,
	"actual_start" timestamp with time zone,
	"actual_end" timestamp with time zone,
	"status" varchar(30) DEFAULT 'pending' NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "charging_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"bus_id" uuid NOT NULL,
	"depot_id" uuid NOT NULL,
	"charger_bay" varchar(20),
	"battery_level_start_pct" real,
	"battery_level_end_pct" real,
	"energy_delivered_kwh" real,
	"started_at" timestamp with time zone NOT NULL,
	"ended_at" timestamp with time zone,
	"status" varchar(30) DEFAULT 'in_progress' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "maintenance_records" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"bus_id" uuid NOT NULL,
	"status" varchar(30) DEFAULT 'scheduled' NOT NULL,
	"type" varchar(50) NOT NULL,
	"description" text,
	"scheduled_date" date,
	"completed_at" timestamp with time zone,
	"performed_by_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_depot_id_depots_id_fk" FOREIGN KEY ("depot_id") REFERENCES "public"."depots"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "buses" ADD CONSTRAINT "buses_depot_id_depots_id_fk" FOREIGN KEY ("depot_id") REFERENCES "public"."depots"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "routes" ADD CONSTRAINT "routes_depot_id_depots_id_fk" FOREIGN KEY ("depot_id") REFERENCES "public"."depots"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dispatch_assignments" ADD CONSTRAINT "dispatch_assignments_bus_id_buses_id_fk" FOREIGN KEY ("bus_id") REFERENCES "public"."buses"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dispatch_assignments" ADD CONSTRAINT "dispatch_assignments_route_id_routes_id_fk" FOREIGN KEY ("route_id") REFERENCES "public"."routes"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dispatch_assignments" ADD CONSTRAINT "dispatch_assignments_assigned_by_id_users_id_fk" FOREIGN KEY ("assigned_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "charging_sessions" ADD CONSTRAINT "charging_sessions_bus_id_buses_id_fk" FOREIGN KEY ("bus_id") REFERENCES "public"."buses"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "charging_sessions" ADD CONSTRAINT "charging_sessions_depot_id_depots_id_fk" FOREIGN KEY ("depot_id") REFERENCES "public"."depots"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "maintenance_records" ADD CONSTRAINT "maintenance_records_bus_id_buses_id_fk" FOREIGN KEY ("bus_id") REFERENCES "public"."buses"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "maintenance_records" ADD CONSTRAINT "maintenance_records_performed_by_id_users_id_fk" FOREIGN KEY ("performed_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "idx_depots_code" ON "depots" USING btree ("code");--> statement-breakpoint
CREATE INDEX "idx_depots_is_active" ON "depots" USING btree ("is_active");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_users_email" ON "users" USING btree ("email");--> statement-breakpoint
CREATE INDEX "idx_users_role" ON "users" USING btree ("role");--> statement-breakpoint
CREATE INDEX "idx_users_depot_id" ON "users" USING btree ("depot_id");--> statement-breakpoint
CREATE INDEX "idx_users_is_active" ON "users" USING btree ("is_active");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_buses_fleet_number" ON "buses" USING btree ("fleet_number");--> statement-breakpoint
CREATE INDEX "idx_buses_depot_id" ON "buses" USING btree ("depot_id");--> statement-breakpoint
CREATE INDEX "idx_buses_status" ON "buses" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_buses_depot_status" ON "buses" USING btree ("depot_id","status");--> statement-breakpoint
CREATE INDEX "idx_buses_battery_level" ON "buses" USING btree ("battery_level_pct");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_routes_number" ON "routes" USING btree ("route_number");--> statement-breakpoint
CREATE INDEX "idx_routes_depot_id" ON "routes" USING btree ("depot_id");--> statement-breakpoint
CREATE INDEX "idx_routes_is_active" ON "routes" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "idx_dispatch_bus_id" ON "dispatch_assignments" USING btree ("bus_id");--> statement-breakpoint
CREATE INDEX "idx_dispatch_route_id" ON "dispatch_assignments" USING btree ("route_id");--> statement-breakpoint
CREATE INDEX "idx_dispatch_assigned_by" ON "dispatch_assignments" USING btree ("assigned_by_id");--> statement-breakpoint
CREATE INDEX "idx_dispatch_scheduled_start" ON "dispatch_assignments" USING btree ("scheduled_start");--> statement-breakpoint
CREATE INDEX "idx_dispatch_status" ON "dispatch_assignments" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_dispatch_status_start" ON "dispatch_assignments" USING btree ("status","scheduled_start");--> statement-breakpoint
CREATE INDEX "idx_dispatch_bus_status" ON "dispatch_assignments" USING btree ("bus_id","status");--> statement-breakpoint
CREATE INDEX "idx_charging_bus_id" ON "charging_sessions" USING btree ("bus_id");--> statement-breakpoint
CREATE INDEX "idx_charging_depot_id" ON "charging_sessions" USING btree ("depot_id");--> statement-breakpoint
CREATE INDEX "idx_charging_started_at" ON "charging_sessions" USING btree ("started_at");--> statement-breakpoint
CREATE INDEX "idx_charging_bus_started_at" ON "charging_sessions" USING btree ("bus_id","started_at");--> statement-breakpoint
CREATE INDEX "idx_charging_status" ON "charging_sessions" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_maintenance_bus_id" ON "maintenance_records" USING btree ("bus_id");--> statement-breakpoint
CREATE INDEX "idx_maintenance_scheduled_date" ON "maintenance_records" USING btree ("scheduled_date");--> statement-breakpoint
CREATE INDEX "idx_maintenance_status" ON "maintenance_records" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_maintenance_bus_status" ON "maintenance_records" USING btree ("bus_id","status");