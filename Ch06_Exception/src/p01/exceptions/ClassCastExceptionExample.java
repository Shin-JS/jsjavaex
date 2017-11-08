package p01.exceptions;
/**[예외처리]
*
**/
public class ClassCastExceptionExample {
	public static void main(String[] args) {
		Dog dog = new Dog();
		change(dog);  //Dog → Animal → Dog
		Cat cat = new Cat();
		change(cat);  //Cat → Animal → Dog
	}
	//매개변수의 다형성
	//Dog → Animal 로 Promotion → (Dog)animal로 Casting
	private static void change(Animal animal) {
		if (animal instanceof Dog) { //매개변수로 들어온 객체가 원래 Dog이었나 확인하는 if문
			Dog dog = (Dog)animal;	
		}
	}
}

class Animal {}
class Dog extends Animal{}
class Cat extends Animal{}
