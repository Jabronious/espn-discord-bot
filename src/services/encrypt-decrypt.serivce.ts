import { DefaultAzureCredential } from '@azure/identity';
import { KeyClient, CryptographyClient, KeyVaultKey } from '@azure/keyvault-keys';
import { configs } from '../configuration';

export class EncryptDecryptService {
	keyClient: KeyClient;
	cryptoClient: CryptographyClient | undefined;

	constructor() {
		const credentials = new DefaultAzureCredential();
		this.keyClient = new KeyClient(configs.KEY_VAULT_URL, credentials);
	}

	async getKey(): Promise<KeyVaultKey> {
		const key = await this.keyClient.getKey(configs.KEY_NAME);
		this.cryptoClient = new CryptographyClient(key.id!, new DefaultAzureCredential());
		return key;
	}

	async encrypt(data: string): Promise<string> {
		if (!this.cryptoClient) {
			await this.getKey();
		}

		const encryptResult = await this.cryptoClient!.encrypt({
			algorithm: 'RSA-OAEP-256',
			plaintext: Buffer.from(data),
		});
		const encryptedString = Buffer.from(encryptResult.result).toString('base64');
		return encryptedString;
	}

	async decrypt(encryptedData: string): Promise<string> {
		if (!this.cryptoClient) {
			await this.getKey();
		}
		const decryptResult = await this.cryptoClient!.decrypt({
			algorithm: 'RSA-OAEP-256',
			ciphertext: Buffer.from(encryptedData, 'base64'),
		});

		return decryptResult.result.toString();
	}
}
