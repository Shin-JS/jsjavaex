
public class WhileEx {
	public static void main(String[] args) {
		int age = 20;
		while (age > 15) {
			System.out.println("hi1");
			age--;
		}
		
		do  {
			System.out.println("hi2");
		} while (age > 15);
		
		age = 12;
		while (age > 8) { 
			age--;
			if (age == 10) {
				continue;
			}
			System.out.println(age);
			

		}
		
		
	
	}
}
