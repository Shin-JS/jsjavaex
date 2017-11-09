package test_solution.interfaces;

public class Unit {
	int hitPoint;
	final int MAX_HP;
	
	Unit(int hp){
		MAX_HP=hp;
	}
}
interface Repairale{}
interface Recovery{}
class GroundUnit extends Unit{
	GroundUnit(int hp){
		super(hp);
	}
}
class AirUnit extends Unit{
	AirUnit(int hp){
		super(hp);
	}
}
class Tank extends GroundUnit implements Repairale{
	Tank(){
		super(150);
		hitPoint = MAX_HP;
	}
	public String toString() {
		return "Tank"+"hitPoint="+hitPoint;
	}
}
class DropShip extends AirUnit implements Repairale{
	DropShip(){
		super(150);
		hitPoint = MAX_HP;
	}
	public String toString() {
		return this.getClass().getSimpleName()+"hitPoint="+hitPoint;
	}
}








