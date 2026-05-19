import { Injectable } from '@angular/core';
import { ApiService } from './api.service';

export interface Agent {
  id: string;
  bureau: string;
  physicalLocation: string;
  staff: string;
  contact: string;
  teamLeader: string;
  teamLeaderContact: string;
  company: string;
  region: string;
  confirmed: boolean;
}

export interface CreateAgentPayload {
  bureau: string;
  physicalLocation: string;
  staff: string;
  contact: string;
  teamLeader: string;
  teamLeaderContact: string;
  company: string;
  region: string;
}

export interface UpdateAgentPayload extends CreateAgentPayload {
  confirmed: boolean;
}

@Injectable({ providedIn: 'root' })
export class AgentService {
  constructor(private api: ApiService) {}

  getAll() { return this.api.get<Agent[]>('/agents', true); }
  create(payload: CreateAgentPayload) { return this.api.post<Agent>('/agents', payload, true); }
  update(id: string, payload: UpdateAgentPayload) { return this.api.put<Agent>(`/agents/${id}`, payload); }
  toggleConfirmed(id: string) { return this.api.patch<{ id: string; confirmed: boolean }>(`/agents/${id}/confirm`, {}); }
}
