import { Component, OnInit } from '@angular/core';
import * as ipfs from 'ipfs-core';
import { IPFSConfig } from 'ipfs-core/src/components/network';
import { SelfHostingService } from './services/self-hosting.service';

const gatewayDomains: string[] = [
  'dweb.link',
  'cf-ipfs.com',
  'infura-ipfs.io'
]

const ipfsConfig: IPFSConfig = {
  Addresses: {
    Swarm: [
      '/dns4/wrtc-star1.par.cjckgpbqc.ga/tcp/443/wss/p2p-webrtc-star/',
      '/dns4/wrtc-star2.tdt.ipfscrosspoint.net/tcp/443/wss/p2p-webrtc-star/',
    ]
  },
  Discovery: {
    MDNS: { Enabled: true, Interval: 10 },
    webRTCStar: { Enabled: true },
  },
};

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'self-hosting-engine';
  id = ''
  agentVersion = ''
  cid: ipfs.CID | undefined;
  links: string[] = [];

  async ngOnInit(): Promise<void> {
    const node = await ipfs.create({ config: ipfsConfig });

    const { id, agentVersion } = await node.id();
    this.id = id;
    this.agentVersion = agentVersion;

    const selfhost = new SelfHostingService(node);
    this.cid = (await selfhost.host()) || undefined;

    if (this.cid) {
      // Create links like: https://bafybeifoiziviatladxmb7hah756lddvyvlgv7t7mwwzr6ul7nkq7nsnjm.ipfs.dweb.link
      this.links = gatewayDomains.map(domain => `https://${this.cid?.toString()}.ipfs.${domain}`);
    }
  }
}
