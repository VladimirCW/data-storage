# Data identifiers storage

## Deploy the application:
 
1. Build the project
    ```
    sam build
    ```
2. Define role
    ```
     $env:AWS_PROFILE = 'mytestadmin'
    ```
3. Create bucket to store application as archive
    ```
    aws s3 mb s3://{bucket_name} --region {region}
    ```
4. Make package
    ```
    sam package --output-template-file .\packaged-template.yaml  --s3-bucket {bucket_name} --profile {profile} --region {region}
    ```
5. Deploy
    ```
    sam deploy --template-file .\template.yaml --region {region} --capabilities CAPABILITY_IAM --stack-name sam-data-storage
    ```

## Debug 

1. Build the project
    ```
    sam build
    ```
2. Deploy localy
    ```
    sam local start-api --profile {profile}
    ```
