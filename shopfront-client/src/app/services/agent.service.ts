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
}

@Injectable({ providedIn: 'root' })
export class AgentService {
  constructor(private api: ApiService) {}

  getAll() { return this.api.get<Agent[]>('/agents', true); }
}
