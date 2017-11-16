package test;

import java.util.Hashtable;
import java.util.Map;
import java.util.Scanner;

/**
 * [List 컬렉션] Map HashTable Thread-safe: 멀티쓰레드환경에서 자료를 보호할 수 있는 구조
 **/
public class HashTableExam {
	static Map<String, String> map = new Hashtable<>();
	static Scanner scanner = new Scanner(System.in);

	public static void main(String[] args) {
		// 1. 회원가입||2. 로그인 ||3. 종료
		// 1. 회원가입: scanner로 입력받아서 저장, 반복저장 종료(체크 후 종료될 수 있도록)
		// 2. 로그인시 패스워드가 5회실패시 프로그램 종료, id가 없으면 가입
		boolean run = true;
		while (run) {
			System.out.println("=============================");
			System.out.println("1.회원가입||2.로그인||3.종료");
			System.out.println("=============================");
			System.out.print("메뉴를 선택하세요: ");
			int selectNo = scanner.nextInt();
			switch (selectNo) {
			case 1:
				join();
				break;
			case 2:
				login();
				break;
			case 3:
				run = false;
			}
		}

	}

	private static void join() {
		while (true) {
			System.out.print("가입할 아이디를 입력하세요: ");
			String id = scanner.next();
			if (map.containsKey(id)) {
				System.out.println("id가 중복됩니다.");
			} else {
				System.out.print("비밀번호를 입력하세요: ");
				String pw = scanner.next();
				map.put(id, pw);
				System.out.println("회원가입이 완료됬습니다.");
				System.out.print("계속 가입 하시겠습니까?(Y/N): ");
				String yesNo = scanner.next();
				if (yesNo.equalsIgnoreCase("n")) {
					System.out.println("회원가입을 종료합니다.");
					break;
				}
			}
		}
	}

	private static void login() {
		while (true) {
			System.out.print("가입한 아이디를 입력하세요: ");
			String id = scanner.next();
			if (map.containsKey(id)) {
				System.out.print("비밀번호를 입력하세요: ");
				String pw = scanner.next();
				if (map.get(id).equals(pw)) {
					System.out.println("로그인 완료");
					break;
				} else {
					for (int i = 1; i <= 4; i++) {
						System.out.println("비밀번호가 다릅니다.(5회 오류시 프로그램이 종료됩니다.)");
						System.out.println("비밀번호를 " + i + "번 틀렸습니다.");
						System.out.print("비밀번호를 다시 입력해주세요: ");
						pw = scanner.next();
						if (map.get(id).equals(pw)) {
							System.out.println("로그인 완료");
						} else {
							System.out.println("비밀번호를 " + (i + 1) + "번 틀렸습니다.");
						}
						if (i == 4) {
							System.out.println("프로그램이 종료됩니다.");
							System.exit(0);
						}
					}
				}
			} else {
				System.out.println("아이디가 없습니다. 가입하시겠습니까?(Y/N)");
				String select = scanner.next();
				if (select.equalsIgnoreCase("y")) {
					join();
				} else {
					break;
				}

			}
		}
	}

}// 클래스 끝
