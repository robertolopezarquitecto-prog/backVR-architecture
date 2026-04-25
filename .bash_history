gcloud compute instances create d5-render-fast     --zone=europe-west4-a     --machine-type=n1-standard-8     --accelerator=count=1,type=nvidia-tesla-t4     --image-family=windows-2022     --image-project=windows-cloud     --boot-disk-size=200GB     --boot-disk-type=pd-ssd     --maintenance-policy=TERMINATE --restart-on-failure
y
gcloud compute instances create d5-render-fast     --zone=europe-west4-a     --machine-type=n1-standard-8     --accelerator=count=1,type=nvidia-tesla-t4     --image-family=windows-2022     --image-project=windows-cloud     --boot-disk-size=200GB     --boot-disk-type=pd-ssd     --maintenance-policy=TERMINATE --restart-on-failure
gcloud compute instances create d5-render-fast     --project=project-176557f6-88f5-4176-ab8     --zone=europe-west1-b     --machine-type=n1-standard-8     --network-interface=network-tier=PREMIUM,stack-type=IPV4_ONLY,subnet=default     --maintenance-policy=TERMINATE     --provisioning-model=SPOT     --service-account=38518242204-compute@developer.gserviceaccount.com     --scopes=[https://www.googleapis.com/auth/devstorage.read_only,https://www.googleapis.com/auth/logging.write,https://www.googleapis.com/auth/monitoring.write,https://www.googleapis.com/auth/servicecontrol,https://www.googleapis.com/auth/service.management.readonly,https://www.googleapis.com/auth/trace.append](https://www.googleapis.com/auth/devstorage.read_only,https://www.googleapis.com/auth/logging.write,https://www.googleapis.com/auth/monitoring.write,https://www.googleapis.com/auth/servicecontrol,https://www.googleapis.com/auth/service.management.readonly,https://www.googleapis.com/auth/trace.append) \
gcloud compute instances create d5-render-v1 --project=project-176557f6-88f5-4176-ab8 --zone=europe-west1-b --machine-type=n1-standard-8 --accelerator=count=1,type=nvidia-tesla-t4 --maintenance-policy=TERMINATE --provisioning-model=SPOT --create-disk=auto-delete=yes,boot=yes,image=projects/windows-cloud/global/images/windows-server-2022-dc-v20240415,size=100,type=pd-balanced --network-tier=PREMIUM
ls -R | grep HotspotManager.ts
git add .
git commit -m "Arreglo de hotspots para la cocina"
git push
git init
git add .
git commit -m "Roberto: Archivos listos para Ross"
git config --global user.email "tu-email@ejemplo.com"robertolopezarquitecto@gmail.com
git config --global user.name "Roberto Lopez"
git commit -m "Roberto: Archivos listos para Ross"
https://github.com/robertolopezarquitecto-prog/backVR-architecture.git
git remote add origin https://github.com/robertolopezarquitecto-prog/backVR-architecture.git
git branch -M main
git push -u origin main
git push -f origin main
git reset HEAD~1
git add src/ public/ package.json tsconfig.json
git rm -r --cached .
git add HotspotManager.ts Viewer.tsx VRViewer.tsx package.json
git rm -r --cached .
git add HotspotManager.ts package.json README-cloudshell.txt
git reset --mixed HEAD~1
git add *.ts *.tsx *.json *.txt *.md *.png *.jpg *.html *.css
git rm -r --cached .
git add .
git reset -- .cache/
git commit -m "Sincronizacion de todo el trabajo desde ayer"
git push -f origin main
git reset HEAD~1
git add .
git reset .cache
git rm -r --cached .cache
git commit -m "Sincronizacion total de todo el trabajo"
git push -f origin main
rm -rf .git
git init
git remote add origin https://github.com/robertolopezarquitecto-prog/backVR-architecture.git
git branch -M main
