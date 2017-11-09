package test.interfaces;

public class RepairableTest {
	public static void main(String[] args) {
		Tank tank = new Tank();
		DropShip dropShip = new DropShip();
		Marine marine = new Marine();
		SCV scv = new SCV();
		scv.repair(tank);
		scv.repair(dropShip);
		Medic medic = new Medic();
		medic.repair(marine);
//		marine.hitPoint = 20;
		medic.recover(marine);
	}
}
class Marine extends GroundUnit implements Recovery, Repairale{
	Marine(){
		super(60);
		hitPoint = MAX_HP;
	}
	public String toString() {
		return "Marine";
	}
}

class SCV extends GroundUnit implements Repairale{
	SCV(){
		super(60);
		hitPoint = MAX_HP;
	}
	
	void repair(Repairale r) {
		if(r instanceof Unit) {
			Unit u = (Unit)r;
			while(u.hitPoint !=u.MAX_HP){
				System.out.println(u.hitPoint++);
			}
			System.out.println(u.toString()+"의 수리가 막 끝났습니다.");
		}
	}
}
class Medic extends GroundUnit implements Recovery, Repairale{
	Medic() {
		super(60);
		hitPoint = MAX_HP;
	}
	void recover(Recovery r) {
		if(r instanceof Unit) {
			Unit u = (Unit)r;
			while(u.hitPoint !=u.MAX_HP){
				System.out.println(u.hitPoint++);
			}
			System.out.println(u.toString()+"의 치료가 막 끝났습니다.");
		}
	}
	void repair(Repairale r) {
		if(r instanceof Unit) {
			Unit u = (Unit)r;
			while(u.hitPoint !=u.MAX_HP){
				System.out.println(u.hitPoint++);
			}
			System.out.println(u.toString()+"의 수리가 막 끝났습니다.");
		}
	}
}