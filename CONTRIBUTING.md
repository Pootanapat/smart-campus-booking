# กฎการทำงานร่วมกัน

- แตก branch จาก `dev` เท่านั้น ห้ามทำงานบน `main`/`dev` โดยตรง
- การตั้งชื่อ branch: `feature/...`, `fix/...`, `chore/...`, `docs/...`
- Commit message ขึ้นต้นด้วย `feat:` `fix:` `chore:` `docs:` `test:`
- รวมงานผ่าน Pull Request เท่านั้น และต้องมีเพื่อนรีวิวอย่างน้อย 1 คน
- ก่อนเปิด PR ต้องรัน `python manage.py test` แล้วผ่านทั้งหมด