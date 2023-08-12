 node {

    load "$JENKINS_HOME/.envvars"
    def application_name= "app_atlas"

        stage('Checkout') {
            if (env.BRANCH_NAME == 'main') {
                echo 'atlas main'
                git branch: 'main',
                url: 'https://github.com/lapig-ufg/atlas-pastagens.git'
            }
            if (env.BRANCH_NAME == 'develop') {
                echo 'atlas develop'
                git branch: 'develop',
                url: 'https://github.com/lapig-ufg/atlas-pastagens.git'

            }

        }
        stage('Validate') {
            if (env.BRANCH_NAME == 'main') {
                sh 'git pull origin main'
            }
            if (env.BRANCH_NAME == 'develop') {
                sh 'git pull origin develop'
            }

        }
        stage('Obter ID do commit') {
            script {
                    def commitId = sh(returnStdout: true, script: 'git log --pretty=format:%h -n 1').trim()
                
                    def json = [:]
                    json['commitId'] = commitId
                    writeFile(file: 'version.json', text: groovy.json.JsonOutput.toJson(json))
            }
            
        }
        
        stage('Build') {
            if (env.BRANCH_NAME == 'main') {
                //INSTALL NVM BINARY AND INSTALL NODE VERSION AND USE NODE VERSION
                nvm(nvmInstallURL: 'https://raw.githubusercontent.com/creationix/nvm/master/install.sh', 
                nvmIoJsOrgMirror: 'https://iojs.org/dist',
                nvmNodeJsOrgMirror: 'https://nodejs.org/dist', 
                version: '16.14.2') {
                    //BUILD APPLICATION 
                    echo "Build main site distribution"
                    sh "npm set progress=false"
                   
                    sh "cd src/server && npm install" 
                    sh "cd src/client && npm install" 
                    sh "ng --version"
                    

                    //VERIFY IF BUILD IS COMPLETE AND NOTIFY IN DISCORD ABOUT OF THE RESULT
                    sh "export NODE_OPTIONS=--max-old-space-size=8096"
                    def status = sh(returnStatus: true, script: "cd src/client && ng build --stats-json --source-map=false --no-progress")
                    if (status != 0) {
                        echo "FAILED BUILD!"
                        currentBuild.result = 'FAILED'
                        def discordImageSuccess = 'https://www.jenkins.io/images/logos/formal/256.png'
                        def discordImageError = 'https://www.jenkins.io/images/logos/fire/256.png'

                        def Author_Name=sh(script: "git show -s --pretty=%an", returnStdout: true).trim()
                        def Author_Email=sh(script: "git show -s --pretty=%ae", returnStdout: true).trim()
                        def Author_Data=sh(script: "git log -1 --format=%cd --date=local",returnStdout: true).trim()
                        def Project_Name=sh(script: "git config --local remote.origin.url",returnStdout: true).trim()
                        def Last_Commit=sh(script: "git show --summary | grep 'commit' | awk '{print \$2}'",returnStdout: true).trim()
                        def Comment_Commit=sh(script: "git log -1 --pretty=%B",returnStdout: true).trim()
                        def Date_Commit=sh(script: "git show -s --format=%ci",returnStdout: true).trim()

                        def discordDesc =
                                "Result: ${currentBuild.currentResult}\n" +
                                        "Project: $Project_Name\n" +
                                        "Commit: $Last_Commit\n" +
                                        "Author: $Author_Name\n" +
                                        "Author_Email: $Author_Email\n" +
                                        "Message: $Comment_Commit\n" +
                                        "Date: $Date_Commit\n" +
                                        "Duration: ${currentBuild.durationString}"

                                        //Variaveis de ambiente do Jenkins - NOME DO JOB E NÚMERO DO JOB
                                        def discordFooter = "${env.JOB_BASE_NAME} (#${BUILD_NUMBER})"
                                        def discordTitle = "${env.JOB_BASE_NAME} (build #${BUILD_NUMBER})"
                                        def urlWebhook = "https://discord.com/api/webhooks/$DiscordKey"

                        discordSend description: discordDesc,
                                footer: discordFooter,
                                link: env.JOB_URL,
                                result: currentBuild.currentResult,
                                title: discordTitle,
                                webhookURL: urlWebhook,
                                successful: currentBuild.resultIsBetterOrEqualTo('SUCCESS'),
                                thumbnail: 'SUCCESS'.equals(currentBuild.currentResult) ? discordImageSuccess : discordImageError              
                            autoCancelled = true
                            error('Aborting the build.')
                    } 
                }  

            }
            if (env.BRANCH_NAME == 'develop') {

                //INSTALL NVM BINARY AND INSTALL NODE VERSION AND USE NODE VERSION
                nvm(nvmInstallURL: 'https://raw.githubusercontent.com/creationix/nvm/master/install.sh', 
                nvmIoJsOrgMirror: 'https://iojs.org/dist',
                nvmNodeJsOrgMirror: 'https://nodejs.org/dist', 
                version: "$NODE_VERSION") {
                    //BUILD APPLICATION 
                    echo "Build homologation site distribution"
                    sh "npm set progress=false"
                    sh "cd src/server && npm install" 
                    sh "cd src/client && npm install" 


                    //VERIFY IF BUILD IS COMPLETE AND NOTIFY IN DISCORD ABOUT OF THE RESULT
                    sh "export NODE_OPTIONS=--max-old-space-size=8096"
                    def status = sh(returnStatus: true, script: "cd src/client && ng build -c homolog --stats-json --source-map=false --no-progress")
                    if (status != 0) {
                        echo "FAILED BUILD!"
                        currentBuild.result = 'FAILED'
                        def discordImageSuccess = 'https://www.jenkins.io/images/logos/formal/256.png'
                        def discordImageError = 'https://www.jenkins.io/images/logos/fire/256.png'

                        def Author_Name=sh(script: "git show -s --pretty=%an", returnStdout: true).trim()
                        def Author_Email=sh(script: "git show -s --pretty=%ae", returnStdout: true).trim()
                        def Author_Data=sh(script: "git log -1 --format=%cd --date=local",returnStdout: true).trim()
                        def Project_Name=sh(script: "git config --local remote.origin.url",returnStdout: true).trim()
                        def Last_Commit=sh(script: "git show --summary | grep 'commit' | awk '{print \$2}'",returnStdout: true).trim()
                        def Comment_Commit=sh(script: "git log -1 --pretty=%B",returnStdout: true).trim()
                        def Date_Commit=sh(script: "git show -s --format=%ci",returnStdout: true).trim()

                        def discordDesc =
                                "Result: ${currentBuild.currentResult}\n" +
                                        "Project: $Project_Name\n" +
                                        "Commit: $Last_Commit\n" +
                                        "Author: $Author_Name\n" +
                                        "Author_Email: $Author_Email\n" +
                                        "Message: $Comment_Commit\n" +
                                        "Date: $Date_Commit\n" +
                                        "Duration: ${currentBuild.durationString}"

                                        //Variaveis de ambiente do Jenkins - NOME DO JOB E NÚMERO DO JOB
                                        def discordFooter = "${env.JOB_BASE_NAME} (#${BUILD_NUMBER})"
                                        def discordTitle = "${env.JOB_BASE_NAME} (build #${BUILD_NUMBER})"
                                        def urlWebhook = "https://discord.com/api/webhooks/$DiscordKey"

                        discordSend description: discordDesc,
                                footer: discordFooter,
                                link: env.JOB_URL,
                                result: currentBuild.currentResult,
                                title: discordTitle,
                                webhookURL: urlWebhook,
                                successful: currentBuild.resultIsBetterOrEqualTo('SUCCESS'),
                                thumbnail: 'SUCCESS'.equals(currentBuild.currentResult) ? discordImageSuccess : discordImageError
                            autoCancelled = true
                            error('Aborting the build.')
                    }                               

                }
            }
        }

        stage('Building Image') {

            if (env.BRANCH_NAME == 'main') {
                dockerImage = docker.build registryprod + "/$application_name:$BUILD_NUMBER", "--no-cache -f docker/production/Dockerfile ."
            }
            if (env.BRANCH_NAME == 'develop') {
                dockerImage = docker.build registryhomol + "/$application_name:$BUILD_NUMBER", "--no-cache -f docker/homologation/Dockerfile ."
            
            }
        }

        stage('Push Image to Registry') {
            docker.withRegistry( "$Url_Private_Registry", "$registryCredential" ) {
                dockerImage.push("${env.BUILD_NUMBER}")
                dockerImage.push("latest")
            }   
        }

        stage('Removing image Locally') {
            if (env.BRANCH_NAME == 'main') {
                sh "docker rmi $registryprod/$application_name:$BUILD_NUMBER"
                sh "docker rmi $registryprod/$application_name:latest"
            }
            if (env.BRANCH_NAME == 'develop') {
                sh "docker rmi $registryhomol/$application_name:$BUILD_NUMBER"
                sh "docker rmi $registryhomol/$application_name:latest"
            }
        }

        stage ('Pull imagem') {
            if (env.BRANCH_NAME == 'main') {
                sshagent(credentials : ['KEY_FULL']) {
                    sh "$SERVER_PROD_SSH 'docker pull $registryprod/$application_name:latest'"
                }

            }
            if (env.BRANCH_NAME == 'develop') {
                sshagent(credentials : ['KEY_FULL']) {
                    sh "$SERVER_HOMOL_SSH 'docker pull $registryhomol/$application_name:latest'"
                }
            }
        }

        stage('Deploy container') {
            if (env.BRANCH_NAME == 'main') {
                configFileProvider([configFile(fileId: "$File_Json_Id_ATLAS_PROD", targetLocation: 'container-atlas-deploy-prod.json')]) {
                    def url = "http://$SERVER_PROD/containers/$application_name?force=true"
                    def response = sh(script: "curl -v -X DELETE $url", returnStdout: true).trim()
                    echo response

                    url = "http://$SERVER_PROD/containers/create?name=$application_name"
                    response = sh(script: "curl -v -X POST -H 'Content-Type: application/json' -d @container-atlas-deploy-prod.json -s $url", returnStdout: true).trim()
                    echo response
                }

            }
            if (env.BRANCH_NAME == 'develop') {
                configFileProvider([configFile(fileId: "$File_Json_Id_ATLAS_HOMOL", targetLocation: 'container-atlas-deploy-homol.json')]) {
                    def url = "http://$SERVER_HOMOL/containers/$application_name?force=true"
                    def response = sh(script: "curl -v -X DELETE $url", returnStdout: true).trim()
                    echo response

                    url = "http://$SERVER_HOMOL/containers/create?name=$application_name"
                    response = sh(script: "curl -v -X POST -H 'Content-Type: application/json' -d @container-atlas-deploy-homol.json -s $url", returnStdout: true).trim()
                    echo response
                }
            }

        }            
        stage('Start container') {
            if (env.BRANCH_NAME == 'main') {
                final String url = "http://$SERVER_PROD/containers/$application_name/start"
                final String response = sh(script: "curl -v -X POST -s $url", returnStdout: true).trim()
                echo response 
            }
            if (env.BRANCH_NAME == 'develop') {
                final String url = "http://$SERVER_HOMOL/containers/$application_name/start"
                final String response = sh(script: "curl -v -X POST -s $url", returnStdout: true).trim()
                echo response 
            }                   

        }                      
        stage('Send message to Discord') {

            //SEND DISCORD NOTIFICATION
            def discordImageSuccess = 'https://www.jenkins.io/images/logos/formal/256.png'
            def discordImageError = 'https://www.jenkins.io/images/logos/fire/256.png'

            def Author_Name=sh(script: "git show -s --pretty=%an", returnStdout: true).trim()
            def Author_Email=sh(script: "git show -s --pretty=%ae", returnStdout: true).trim()
            def Author_Data=sh(script: "git log -1 --format=%cd --date=local",returnStdout: true).trim()
            def Project_Name=sh(script: "git config --local remote.origin.url",returnStdout: true).trim()
            def Last_Commit=sh(script: "git show --summary | grep 'commit' | awk '{print \$2}'",returnStdout: true).trim()
            def Comment_Commit=sh(script: "git log -1 --pretty=%B",returnStdout: true).trim()
            def Date_Commit=sh(script: "git show -s --format=%ci",returnStdout: true).trim()

            def discordDesc =
                    "Result: ${currentBuild.currentResult}\n" +
                            "Project: $Project_Name\n" +
                            "Commit: $Last_Commit\n" +
                            "Author: $Author_Name\n" +
                            "Author_Email: $Author_Email\n" +
                            "Message: $Comment_Commit\n" +
                            "Date: $Date_Commit\n" +
                            "Duration: ${currentBuild.durationString}"

                            //Variaveis de ambiente do Jenkins - NOME DO JOB E NÚMERO DO JOB
                            def discordFooter = "${env.JOB_BASE_NAME} (#${BUILD_NUMBER})"
                            def discordTitle = "${env.JOB_BASE_NAME} (build #${BUILD_NUMBER})"
                            def urlWebhook = "https://discord.com/api/webhooks/$DiscordKey"

            discordSend description: discordDesc,
                    footer: discordFooter,
                    link: env.JOB_URL,
                    result: currentBuild.currentResult,
                    title: discordTitle,
                    webhookURL: urlWebhook,
                    successful: currentBuild.resultIsBetterOrEqualTo('SUCCESS'),
                    thumbnail: 'SUCCESS'.equals(currentBuild.currentResult) ? discordImageSuccess : discordImageError              

        }         

        stage('Send message to Telegram') {

            def Author_Name=sh(script: "git show -s --pretty=%an", returnStdout: true).trim()
            def Author_Email=sh(script: "git show -s --pretty=%ae", returnStdout: true).trim()
            def Author_Data=sh(script: "git log -1 --format=%cd --date=local",returnStdout: true).trim()
            def Project_Name=sh(script: "git config --local remote.origin.url",returnStdout: true).trim()
            def Last_Commit=sh(script: "git show --summary | grep 'commit' | awk '{print \$2}'",returnStdout: true).trim()
            def Comment_Commit=sh(script: "git log -1 --pretty=%B",returnStdout: true).trim()
            def Date_Commit=sh(script: "git show -s --format=%ci",returnStdout: true).trim()  
            def Branch_Name=sh(script: "git rev-parse --abbrev-ref HEAD",returnStdout: true).trim()

            withCredentials([string(credentialsId: 'telegramToken', variable: 'TOKEN'), string(credentialsId: 'telegramChatId', variable: 'CHAT_ID')]) {
                sh  ("""
                    curl -s -X POST https://api.telegram.org/bot${TOKEN}/sendMessage -d chat_id=${CHAT_ID} -d parse_mode=markdown -d text='*Project*: *${Project_Name}* \n *Branch*: ${Branch_Name} \n *Author*: *${Author_Name}* \n *Author_Email*: *${Author_Email}* \n *Commit_ID*: *${Last_Commit}* \n *Message_Commit*: *${Comment_Commit}* \n *Date_Commit*: *${Date_Commit}* \n *Duration*: *${currentBuild.durationString}*'
                """)
            }
        }

    }
