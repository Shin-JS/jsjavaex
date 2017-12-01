package p03.prepareGui;

import java.awt.BorderLayout;
import java.awt.Container;
import java.awt.Dimension;
import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;

import javax.swing.JButton;
import javax.swing.JFrame;
import javax.swing.JOptionPane;
import javax.swing.JScrollPane;
import javax.swing.JTable;

/**[JDBC]
 * DB정보 로드해서 GUI로 뿌리기
 **/
public class AddressPrint2 implements ActionListener{
	static JTable table;
	public static void main(String[] args) {
		//윈도우 프레임 생성
		JFrame frame = new JFrame("연락처 출력 프로그램");
		//프레임사이즈 설정
		frame.setPreferredSize(new Dimension(300,200));
		//프레임 위치 조정
		frame.setLocation(300, 200);
		//Container 얻기
		Container contentPane = frame.getContentPane();
		//data구성
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
		table = new JTable(data2,colName);
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
		frame.setDefaultCloseOperation(frame.EXIT_ON_CLOSE);
		frame.pack();
		frame.setVisible(true);
		} catch (Exception e) {
			System.out.println(e.getMessage());
		}
	}
	//Listener 구현한 클래스: 메소드 재정의
	@Override
	public void actionPerformed(ActionEvent e) {

		int selectedRow = table.getSelectedRow(); //선택된 행 번호 반환
		if(selectedRow > -1) {
			int i = 0;
			int no = (int) table.getValueAt(selectedRow, i);
			String name = (String) table.getValueAt(selectedRow, ++i);
			String address = (String) table.getValueAt(selectedRow, ++i);
			String tel = (String) table.getValueAt(selectedRow, ++i);
			JOptionPane.showMessageDialog(table, no+":"+name+":"+address+":"+tel);
		}

		
		
	}
}
