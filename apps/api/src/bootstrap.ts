import { INestApplication } from '@nestjs/common';
import { NestFactory, Reflector } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
// // import { SentryService } from '@ntegral/nestjs-sentry';
// import { useContainer } from 'class-validator';
import session from 'express-session';
// import * as helmet from 'helmet';
import chalk from 'chalk';
// import { join } from 'path';
import { urlencoded, json } from 'express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { APP_CONFIG_NAME, IConfigApp } from '../config';
import { JwtAuthGuard } from '@owl/jwt-auth-guard';
import { HttpExceptionsFilter } from '../http';
// import { EntitySubscriberInterface } from 'typeorm';
// // import { IPluginConfig } from '@gauzy/common';
// import { getConfig, setConfig, environment as env } from '@gauzy/config';
// import { getEntitiesFromPlugins } from '@gauzy/plugin';
// import { coreEntities } from '../core/entities';
// import { coreSubscribers } from './../core/entities/subscribers';
// import { AppService } from '../app.service';
// import { AppModule } from '../app.module';
// import { AuthGuard } from './../shared/guards';
// import { SharedModule } from './../shared/shared.module';

export async function bootstrap(
    bootstrapModule: any
): Promise<INestApplication> {
    const app = await NestFactory.create<NestExpressApplication>(bootstrapModule, {
        logger: ['log', 'error', 'warn', 'debug', 'verbose']
    });

    const allowedHeaders = [
        'Authorization',
        'Language',
        'Tenant-Id',
        'X-Requested-With',
        'X-Auth-Token',
        'X-HTTP-Method-Override',
        'Content-Type',
        'Content-Language',
        'Accept',
        'Accept-Language',
        'Observe',
        'Set-Cookie'
    ];

    const reflector = app.get(Reflector);
    app.useGlobalGuards(new JwtAuthGuard(reflector));

    // // app.useLogger(app.get(SentryService));
    app.use(json({ limit: '10mb' }));
    app.use(urlencoded({ extended: true, limit: '10mb' }));

    app.enableCors({
        origin: '*',
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
        credentials: true,
        allowedHeaders: allowedHeaders.join(',')
    });

    app.use(
    	session({
    		secret: 'asdad',
    		resave: true,
    		saveUninitialized: true
    	})
    );

    const configService = app.get(ConfigService);
    const { version } = configService.get<IConfigApp>(APP_CONFIG_NAME);
    const globalPrefix = 'api/' + version;

    app.setGlobalPrefix(globalPrefix);

    const options = new DocumentBuilder()
    	.setTitle('Owl API')
    	.setVersion('1.0')
    	.addBearerAuth()
    	.build();

    const document = SwaggerModule.createDocument(app, options);
    SwaggerModule.setup('swg', app, document, {
        swaggerOptions: {
          tagsSorter: 'alpha',
          operationsSorter: 'alpha',
          },
        });

    
    let { port, host } = configService.get<IConfigApp>(APP_CONFIG_NAME);

    if (!port) {
    	port = 3000;
    }
    if (!host) {
    	host = '0.0.0.0';
    }

    console.log(chalk.green(`Host: ${host}`));
    console.log(chalk.green(`Port: ${port}`));

    console.log(chalk.magenta(`Swagger UI at http://${host}:${port}/swg`));

    // /**
    //  * Dependency injection with class-validator
    //  */
    // // useContainer(app.select(SharedModule), { fallbackOnErrors: true });

    await app.listen(port, host, () => {
    	console.log(chalk.magenta(`Listening at http://${host}:${port}/${globalPrefix}`));
    });

    return app;
}

// /**
//  * Setting the global config must be done prior to loading the Bootstrap Module.
//  */
// export async function registerPluginConfig(
// 	pluginConfig: Partial<IPluginConfig>
// ) {
// 	if (Object.keys(pluginConfig).length > 0) {
// 		setConfig(pluginConfig);
// 	}

// 	/**
// 	 * Configure migration settings
// 	 */
// 	setConfig({
// 		dbConnectionOptions: {
// 			...getMigrationsSetting()
// 		}
// 	});

// 	console.log(
// 		chalk.green(
// 			`DB Config: ${JSON.stringify(getConfig().dbConnectionOptions)}`
// 		)
// 	);

// 	/**
// 	 * Registered core & plugins entities
// 	 */
// 	const entities = await registerAllEntities(pluginConfig);
// 	setConfig({
// 		dbConnectionOptions: {
// 			entities,
// 			subscribers: coreSubscribers as Array<Type<EntitySubscriberInterface>>,
// 		}
// 	});

// 	let registeredConfig = getConfig();
// 	return registeredConfig;
// }

// /**
//  * Returns an array of core entities and any additional entities defined in plugins.
//  */
// export async function registerAllEntities(
// 	pluginConfig: Partial<IPluginConfig>
// ) {
// 	const allEntities = coreEntities as Array<Type<any>>;
// 	const pluginEntities = getEntitiesFromPlugins(pluginConfig.plugins);

// 	for (const pluginEntity of pluginEntities) {
// 		if (allEntities.find((e) => e.name === pluginEntity.name)) {
// 			throw new ConflictException({
// 				message: `error.${pluginEntity.name} conflict by default entities`
// 			});
// 		} else {
// 			allEntities.push(pluginEntity);
// 		}
// 	}
// 	return allEntities;
// }

// /**
//  * GET migrations directory & CLI paths
//  *
//  * @returns
//  */
// export function getMigrationsSetting() {

// 	console.log(`Reporting __dirname: ${__dirname}`);

// 	//TODO: We need to define some dynamic path here
// 	return {
// 		migrations: [
// 			// join(__dirname, '../../src/database/migrations/*{.ts,.js}'),
// 			join(__dirname, '../database/migrations/*{.ts,.js}')
// 		],
// 		cli: {
// 			migrationsDir: join(__dirname, '../../src/database/migrations')
// 		},
// 	}
// }