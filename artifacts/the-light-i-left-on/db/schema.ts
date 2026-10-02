import {sqliteTable,text,integer,index,primaryKey} from 'drizzle-orm/sqlite-core';
export const notes=sqliteTable('wall_notes',{
 id:text('id').primaryKey(),body:text('body').notNull(),direction:text('direction').notNull(),createdAt:integer('created_at').notNull(),status:text('status').notNull().default('visible'),deleteHash:text('delete_hash').notNull()
},t=>[index('idx_wall_notes_status_created').on(t.status,t.createdAt,t.id)]);
export const rate=sqliteTable('wall_rate',{
 actor:text('actor').notNull(),bucket:integer('bucket').notNull(),count:integer('count').notNull().default(1)
},t=>[primaryKey({columns:[t.actor,t.bucket]})]);
export const reports=sqliteTable('wall_reports',{
 noteId:text('note_id').notNull(),actor:text('actor').notNull(),createdAt:integer('created_at').notNull()
},t=>[primaryKey({columns:[t.noteId,t.actor]})]);
