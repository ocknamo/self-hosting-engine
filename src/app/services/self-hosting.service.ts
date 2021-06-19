import * as CID from 'cids';
import { ImportCandidateStream } from 'ipfs-core-types/src/utils';
import IPFS from 'ipfs-core/src/components';
import { environment } from 'src/environments/environment';

import pj from '../../../package.json';

interface SelfHostMeta {
  filenames: string[];
}

const DIRECTORY_NAME = pj.name;

/**
 * Host this SPA application on its IPFS node.
 * This service works on https only.
 * Meta file like "appfilelist.json" is needed. It should be generated after application build.
 * Reference: scripts/generate-builded-files-list.sh
 */
export class SelfHostingService {
  /**
   * This is the application root CID.
   * You can use this application via gateway by this CID.
   * eg. https://gateway.ipfs.io/ipfs/<CID>
   */
  directoryCID: CID | undefined;

  private baseUrl = window.location.origin;
  private selfHostMetaPath = '/appfilelist.json';

  constructor(
    private readonly ipfsNode: IPFS
  ) {}

  /**
   * Host this SPA application files on PFS node.
   *
   * @returns Promise<CID | void>
   */
  async host(): Promise<CID | void> {
    // TODO: dev-server
    if (!environment.production) {
      return;
    }

    // Fetch meta data.
    const res = await fetch(`${this.baseUrl}${this.selfHostMetaPath}`);
    if (!res.ok) {
      throw new Error('No meta file for self host.');
    }
    const meta: SelfHostMeta = await res.json();

    // Fetch application data.
    const files = await this.fetchMyself(meta);

    // Prepare file contents.
    const fileToAdd: ImportCandidateStream = files.map((f) => ({
      path: `/${DIRECTORY_NAME}/${f.name}`,
      content: f.content,
    }));

    // Add all files into IPFS node.
    const added = this.ipfsNode.addAll(fileToAdd, { cidVersion: 1 });

    // Get directory CID.
    for await (const v of added) {
      if (v.path === DIRECTORY_NAME) {
        this.directoryCID = v.cid;
      }
    }

    return this.directoryCID;
  }

  /**
   * Fetch all application file from origin.
   * The meta file should have the information for all the necessary files.
   *
   * @param meta SelfHostMeta
   * @returns Promise<{ name: string; content: Blob}[]>
   */
  private async fetchMyself(
    meta: SelfHostMeta
  ): Promise<{ name: string; content: Blob }[]> {
    const promises = meta.filenames.map((filename) =>
      fetch(`${this.baseUrl}/${filename}`).then((res) => ({
        name: filename,
        content: res,
      }))
    );

    const responses = await Promise.all(promises);
    const src = responses.map((v) =>
      v.content.blob().then((b) => ({ name: v.name, content: b }))
    );
    return Promise.all(src);
  }
}
