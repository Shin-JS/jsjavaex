package p08.abstracts;
/** [추상클래스]
 *  
 **/
public class AnimalExample1 {
	public static void main(String[] args) {
//		Animal animal = new Animal(); //추상클래스는 클래스자신을 객체화 시킬 수 없다.
		Bird1 bird = new Bird1(); //추상클래스인 Animal을 상속받은 실체의 객체화
		Insect1 insect = new Insect1(); //추상클래스인 Animal을 상속받은 실체의 객체화
		Fish1 fish = new Fish1(); //추상클래스인 Animal을 상속받은 실체의 객체화
		
		Animal[] animals = new Animal[3];
		animals[0] = bird;
		animals[1] = insect;
		animals[2] = fish;
		for(int i = 0; i < animals.length; i++) {
			animals[i].sing(); //메소드의 다형성 구현
			animals[i].fly();
			animals[i].eat();
		}
	}
}
