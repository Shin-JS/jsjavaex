package p03.prepareGui;

import java.awt.BorderLayout;
import java.awt.Container;
import java.awt.Dimension;
import java.awt.GridLayout;
import java.awt.HeadlessException;
import java.awt.TextField;
import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;

import javax.swing.JButton;
import javax.swing.JCheckBoxMenuItem;
import javax.swing.JFrame;
import javax.swing.JLabel;
import javax.swing.JMenu;
import javax.swing.JMenuBar;
import javax.swing.JMenuItem;
import javax.swing.JOptionPane;
import javax.swing.JPanel;
import javax.swing.JRadioButtonMenuItem;
import javax.swing.JScrollPane;
import javax.swing.JTable;
import javax.swing.JTextField;

/**[JDBC]
 * 메뉴 만들기
 **/
public class JMenu2 extends JFrame implements ActionListener{
	//필드
	TextField textField;
	Container contentPane = getContentPane();

	//생성자
	public JMenu2() throws HeadlessException{

		contentPane.setLayout(new BorderLayout());
		JMenuBar jmb = new JMenuBar(); //메뉴바 객체 생성
		JMenu menu1 = new JMenu("파일");
		JMenu menu2 = new JMenu("편집");
		//메뉴아이템 생성
		JMenuItem jmi = new JMenuItem("주소록 입력");
		jmi.addActionListener(this); //메뉴아이템에 리스너 붙이기
		menu1.add(jmi); //메뉴에 메뉴아이템 붙이기
		jmb.add(menu1); //메뉴바에 메뉴 붙이기
		
		jmi = new JMenuItem("주소록 출력"); //메뉴아이템 생성
		jmi.addActionListener(this); //메뉴아이템에 리스너 붙이기
		menu1.add(jmi); //메뉴에 메뉴아이템 붙이기
		jmb.add(menu1); //메뉴바에 메뉴 붙이기

		setJMenuBar(jmb); //메뉴프레임에 메뉴바 추가
		textField = new TextField();
//		contentPane.add(textField,BorderLayout.SOUTH); 버튼을 가려서 제거
		setTitle("JMenuTest");
		setSize(300, 200);
		setVisible(true);
		setDefaultCloseOperation(EXIT_ON_CLOSE);

	}
	
	
	//이벤트메소드
	//발생한 이벤트 객체를 String타입으로 반환하는 메소드: getActionCommand();
	@Override
	public void actionPerformed(ActionEvent e) {
		String test = e.getActionCommand();
		if(test=="주소록 입력") {
			contentPane.removeAll(); //먼저 안에있던 것들 제거
			JPanel panel = new JPanel();
			panel.setLayout(new GridLayout(4, 2));
			JTextField text1 = new JTextField();
			JTextField text2 = new JTextField();
			JTextField text3 = new JTextField();
			JButton button = new JButton("입력");
			panel.add(new JLabel("이름"));
			panel.add(text1);
			panel.add(new JLabel("주소"));
			panel.add(text2);
			panel.add(new JLabel("전화번호"));
			panel.add(text3);
			contentPane.add(panel,BorderLayout.CENTER);
			//리스너 부착
			ActionListener listner = new AddActionListener(text1, text2, text3);
			button.addActionListener(listner);
			contentPane.add(button,BorderLayout.SOUTH);
			setVisible(true);

		}else if(test=="주소록 출력"){
			contentPane.removeAll();
			String[] colName = {"no","이름","주소","전화번호"}; //헤드부분 데이터 생성
			Object[][] data = new Object[100][4]; //데이터 저장공간 생성
			//1단계 로드
			Connection conn = Connections.getInstance().getConnection();
			//2단계 쿼리객체 생성
			String sql = "select * from address";
			try {

				PreparedStatement pstmt = conn.prepareStatement(sql);
				ResultSet rs = pstmt.executeQuery();
				int i = 0;
				while(rs.next()) {
					data[i][0] = rs.getInt(1);
					data[i][1] = rs.getString(2);
					data[i][2] = rs.getString(3);
					data[i++][3] = rs.getString(4);

				}
				Object[][]data2 = new Object[i][4]; //입력된 행(row)만큼 이차원배열 생성
				for(int j = 0; j<i ;j++) {
					for(int k = 0; k<4 ;k++) {
						data2[j][k] = data[j][k];
					}
				}
		
			//4단계 쿼리종료
				rs.close();
				pstmt.close();
				conn.close();
			//테이블 생성
			JTable table = new JTable(data2,colName);
			//컨테이너 배치
			JScrollPane scrollPane = new JScrollPane(table);
			//중앙에 배치
			contentPane.add(scrollPane, BorderLayout.CENTER);
			//출력버튼
			JButton button = new JButton("출력");
			//아래쪽 배치
			contentPane.add(button,BorderLayout.SOUTH);
			//리스너 생성
			ActionListener listener = new PrintActionListener(table) ;
			//리스너 부착
			button.addActionListener(listener);
			//보이기
			setVisible(true);
			} catch (Exception e1) {
				System.out.println(e1.getMessage());
			}
		}
	}

	public static void main(String[] args) {
		new JMenu2();
	}
}
