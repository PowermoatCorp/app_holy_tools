export namespace config {
	
	export class Application {
	    language: string;
	    theme: string;
	
	    static createFrom(source: any = {}) {
	        return new Application(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.language = source["language"];
	        this.theme = source["theme"];
	    }
	}
	export class BackupSettings {
	    enabled: boolean;
	    intervalMinutes: number;
	    folder: string;
	    keepCount: number;
	    lastBackup: any;
	
	    static createFrom(source: any = {}) {
	        return new BackupSettings(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.enabled = source["enabled"];
	        this.intervalMinutes = source["intervalMinutes"];
	        this.folder = source["folder"];
	        this.keepCount = source["keepCount"];
	        this.lastBackup = this.convertValues(source["lastBackup"], null);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		    	return (a as any[]).map(elem => this.convertValues(elem, classs));
		} else if ("object" === typeof a) {
		    if (asMap) {
		        for (const key of Object.keys(a)) {
		            a[key] = new classs(a[key]);
		        }
		        return a;
		    }
		    return new classs(a);
		}
		return a;
		}
	}
	export class Metadata {
	    // Go type: time
	    createdAt: any;
	    // Go type: time
	    lastModified: any;
	    modifiedBy: string;
	
	    static createFrom(source: any = {}) {
	        return new Metadata(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.createdAt = this.convertValues(source["createdAt"], null);
	        this.lastModified = this.convertValues(source["lastModified"], null);
	        this.modifiedBy = source["modifiedBy"];
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		    	return (a as any[]).map(elem => this.convertValues(elem, classs));
		} else if ("object" === typeof a) {
		    if (asMap) {
		        for (const key of Object.keys(a)) {
		            a[key] = new classs(a[key]);
		        }
		        return a;
		    }
		    return new classs(a);
		}
		return a;
		}
	}
	export class Database {
	    type: string;
	    host: string;
	    port: number;
	    username: string;
	    password: string;
	    database: string;
	
	    static createFrom(source: any = {}) {
	        return new Database(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.type = source["type"];
	        this.host = source["host"];
	        this.port = source["port"];
	        this.username = source["username"];
	        this.password = source["password"];
	        this.database = source["database"];
	    }
	}
	export class Config {
	    version: string;
	    database: Database;
	    application: Application;
	    backup: BackupSettings;
	    metadata: Metadata;
	
	    static createFrom(source: any = {}) {
	        return new Config(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.version = source["version"];
	        this.database = this.convertValues(source["database"], Database);
	        this.application = this.convertValues(source["application"], Application);
	        this.backup = this.convertValues(source["backup"], BackupSettings);
	        this.metadata = this.convertValues(source["metadata"], Metadata);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		    	return (a as any[]).map(elem => this.convertValues(elem, classs));
		} else if ("object" === typeof a) {
		    if (asMap) {
		        for (const key of Object.keys(a)) {
		            a[key] = new classs(a[key]);
		        }
		        return a;
		    }
		    return new classs(a);
		}
		return a;
		}
	}
	export class BackupResult {
	    success: boolean;
	    message: string;
	    filePath: string;
	    backupAt: any;
	
	    static createFrom(source: any = {}) {
	        return new BackupResult(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.success = source["success"];
	        this.message = source["message"];
	        this.filePath = source["filePath"];
	        this.backupAt = this.convertValues(source["backupAt"], null);
	    }

    convertValues(a: any, classs: any, asMap: boolean = false): any {
        if (!a) {
            return a;
        }
        if (a.slice && a.map) {
            return (a as any[]).map(elem => this.convertValues(elem, classs));
        } else if ("object" === typeof a) {
            if (asMap) {
                for (const key of Object.keys(a)) {
                    a[key] = new classs(a[key]);
                }
                return a;
            }
            return new classs(a);
        }
        return a;
    }
}
export class ConnectionTestResult {
    success: boolean;
    message: string;
    latency: number;

    static createFrom(source: any = {}) {
        return new ConnectionTestResult(source);
    }

    constructor(source: any = {}) {
        if ('string' === typeof source) source = JSON.parse(source);
        this.success = source["success"];
        this.message = source["message"];
        this.latency = source["latency"];
    }
}

}
