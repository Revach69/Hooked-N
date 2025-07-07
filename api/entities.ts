import { base44 } from './base44Client';
import type { EntityMethods, AuthModule } from '@base44/sdk';


export const Event: EntityMethods = base44.entities.Event;

export const EventProfile: EntityMethods = base44.entities.EventProfile;

export const Like: EntityMethods = base44.entities.Like;

export const Message: EntityMethods = base44.entities.Message;

export const ContactShare: EntityMethods = base44.entities.ContactShare;

export const EventFeedback: EntityMethods = base44.entities.EventFeedback;



// auth sdk:
export const User: AuthModule = base44.auth;
