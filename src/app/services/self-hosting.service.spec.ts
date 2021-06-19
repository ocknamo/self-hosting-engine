import { TestBed } from '@angular/core/testing';
import IPFS from 'ipfs-core/src/components';

import { SelfHostingService } from './self-hosting.service';

describe('SelfHostingService', () => {
  let service: SelfHostingService;

  beforeEach(() => {
    service = new SelfHostingService({} as IPFS);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
