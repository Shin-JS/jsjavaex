package test_solution.interfaces;

import java.util.Scanner;

public class RepairableTest {
	public static void main(String[] args) {
		Tank tank = new Tank();
		DropShip dropShip = new DropShip();
		Marine marine = new Marine();
		System.out.println(tank.toString());
		System.out.println(dropShip.toString());
		System.out.println(marine.toString());
		SCV scv = new SCV();
		SCV1 scv1 = new SCV1();
		Damaged att = new Damaged();
		att.attacked(tank);
		att.attacked(dropShip);
		att.attacked(marine);
		scv.repair(tank);
		scv.repair(dropShip);
		scv1.repair(marine);
	}
}
class Marine extends GroundUnit implements Recovery{
	Marine(){
		super(60);
		hitPoint = MAX_HP;
	}
	public String toString() {
		return this.getClass().getSimpleName()+"hitPoint="+hitPoint;
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
				System.out.print(u.hitPoint++ +"\t");
			}
			System.out.println();
			System.out.println(u.toString()+"의 수리가 막 끝났습니다.");
		}
	}
}

class SCV1 extends GroundUnit implements Recovery{
	SCV1(){
		super(60);
		hitPoint = MAX_HP;
	}
	void repair(Unit r) {
		if(r instanceof Recovery) {
			Unit u = (Unit)r;
			while(u.hitPoint !=u.MAX_HP){
				System.out.print(u.hitPoint++ +"\t");
			}
			System.out.println();
			System.out.println(u.toString()+"이(가) 회복되었습니다.");
		}
	}
}

class Damaged{	
	void attacked(Unit u) {
		System.out.print("공격받은 hp를 입력하세요>");
		Scanner scanner = new Scanner(System.in);
		 int lowerHp = scanner.nextInt();
			while(u.hitPoint >lowerHp){
				System.out.print(u.hitPoint-- +"\t");
			}
			System.out.println();
			System.out.println(u.toString()+"의 hp가 "+u.hitPoint+"로 줄어들었습니다.");
		}
	}