package p08.abstracts;
/** [추상클래스]
 *  
 **/
public class Fish1 extends Animal{

	@Override
	public void sing() {
		System.out.println("물고기가 운다");
	}

	@Override
	public void fly() {
		System.out.println("물고기가 난다");
	}

	@Override
	public void eat() {
		System.out.println("물고기가 먹는다");
	}
}
